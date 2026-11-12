// Best-effort per-instance rate limiter. For globally consistent limits across serverless instances,
// configure a shared store (for example Upstash Redis) before high-traffic public launch.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(req: Request, scope: string, limit: number, windowMs: number) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = req.headers.get("x-real-ip")?.trim() || forwarded || "unknown";
  const key = scope + ":" + ip;
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (buckets.size > 5000) {
    buckets.forEach((value, entry) => { if (value.resetAt <= now) buckets.delete(entry); });
  }
  return {
    allowed: bucket.count <= limit,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json(
    { error: "طلبات كثيرة خلال وقت قصير. حاول مرة أخرى بعد قليل." },
    { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
  );
}
