import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

type LimitResult = { allowed: boolean; retryAfter: number; unavailable?: boolean };

export async function rateLimit(req: Request, scope: string, limit: number, windowMs: number): Promise<LimitResult> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return { allowed: false, retryAfter: 60, unavailable: true };

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = req.headers.get("x-real-ip")?.trim() || forwarded || "unknown";
  // Store only a keyed digest, not the raw IP address or beneficiary identifier.
  const key = createHmac("sha256", secret).update(scope + ":" + ip).digest("hex");

  try {
    const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
      VALUES (${key}, 1, NOW() + (${windowMs} * INTERVAL '1 millisecond'), NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimitBucket"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
          ELSE "RateLimitBucket"."resetAt"
        END,
        "updatedAt" = NOW()
      RETURNING "count", "resetAt"
    `;
    const bucket = rows[0];
    if (!bucket) return { allowed: false, retryAfter: 60, unavailable: true };

    // Opportunistically prune expired keys without adding a cleanup query to every request.
    if (bucket.count % 100 === 0) {
      try {
        await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lte: new Date() } } });
      } catch {
        // Cleanup is best-effort; the atomic limit decision above remains valid.
      }
    }

    return {
      allowed: bucket.count <= limit,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt.getTime() - Date.now()) / 1000)),
    };
  } catch {
    // Fail closed: do not bypass protection when the shared store is unavailable.
    return { allowed: false, retryAfter: 60, unavailable: true };
  }
}

export function rateLimitResponse(retryAfter: number, unavailable = false) {
  return Response.json(
    { error: unavailable ? "تعذر التحقق من حماية الطلبات. حاول مرة أخرى بعد قليل." : "طلبات كثيرة خلال وقت قصير. حاول مرة أخرى بعد قليل." },
    { status: unavailable ? 503 : 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
  );
}
