import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 1_100_000;

// Cookie-authenticated writes must originate from this exact application origin.
// Browsers send Origin for PUT requests; Referer is a compatibility fallback.
// Missing, malformed, opaque, or cross-origin values fail closed.
function hasSameOrigin(req: NextRequest): boolean {
  const expectedOrigin = req.nextUrl.origin;
  const origin = req.headers.get("origin");
  if (origin !== null) {
    try {
      return new URL(origin).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === expectedOrigin;
  } catch {
    return false;
  }
}

async function readBoundedJson(req: NextRequest): Promise<{ tooLarge: boolean; value: unknown }> {
  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return { tooLarge: true, value: null };
  }

  if (!req.body) return { tooLarge: false, value: null };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return { tooLarge: true, value: null };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { tooLarge: false, value: JSON.parse(new TextDecoder().decode(body)) };
  } catch {
    return { tooLarge: false, value: null };
  }
}

const dataSchema = z.object({
  "humanity-one-initiatives-v1": z.string().max(500_000).nullable(),
  "humanity-one-tasks-v1": z.string().max(500_000).nullable(),
  "humanity-one-approved-memory-v1": z.string().max(200_000).nullable(),
  "humanity-one-approved-memory-v1:enabled": z.string().max(20).nullable(),
  "humanity-one-chat-v2": z.string().max(500_000).nullable(),
}).strict();

const updateSchema = z.object({
  data: dataSchema.optional(),
  language: z.enum(["ar", "en"]).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
}).strict().refine((value) => value.data !== undefined || value.language !== undefined || value.theme !== undefined);

export async function GET(req: NextRequest) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول بحساب المستفيد للوصول إلى المزامنة." }, { status: 401 });

  const limit = await rateLimit(req, "beneficiary-workspace-read", 60, 5 * 60 * 1000, user.id);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  try {
    const workspace = await prisma.userWorkspace.findUnique({
      where: { userId: user.id },
      select: { data: true, language: true, theme: true, updatedAt: true },
    });
    return NextResponse.json({ user: { name: user.name, email: user.email }, workspace }, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    return NextResponse.json({ error: "خدمة المزامنة غير متاحة حاليًا." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  if (!hasSameOrigin(req)) {
    return NextResponse.json({ error: "مصدر الطلب غير موثوق." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول بحساب المستفيد أولًا." }, { status: 401 });

  const limit = await rateLimit(req, "beneficiary-workspace-write", 20, 10 * 60 * 1000, user.id);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  const requestBody = await readBoundedJson(req);
  if (requestBody.tooLarge) {
    return NextResponse.json({ error: "حجم الطلب أكبر من الحد المسموح (1.1 ميجابايت)." }, { status: 413 });
  }

  const parsed = updateSchema.safeParse(requestBody.value);
  if (!parsed.success) return NextResponse.json({ error: "بيانات المزامنة غير صالحة." }, { status: 400 });

  if (parsed.data.data) {
    const size = Buffer.byteLength(JSON.stringify(parsed.data.data), "utf8");
    if (size > 1_000_000) return NextResponse.json({ error: "حجم النسخة أكبر من الحد المسموح (1 ميجابايت)." }, { status: 413 });
  }

  try {
    const saved = await prisma.userWorkspace.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        data: parsed.data.data ?? {},
        language: parsed.data.language ?? "ar",
        theme: parsed.data.theme ?? "dark",
      },
      update: {
        ...(parsed.data.data !== undefined ? { data: parsed.data.data } : {}),
        ...(parsed.data.language !== undefined ? { language: parsed.data.language } : {}),
        ...(parsed.data.theme !== undefined ? { theme: parsed.data.theme } : {}),
      },
      select: { data: true, language: true, theme: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, workspace: saved }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر حفظ بيانات المزامنة." }, { status: 503 });
  }
}
