import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validToken(provided: string | null, storedHash: string | null) {
  if (!provided || !storedHash) return false;
  const candidate = createHash("sha256").update(provided).digest();
  const expected = Buffer.from(storedHash, "hex");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

// The employer's one-time secret is stored only as a SHA-256 hash.
// It is never included in public job responses.
export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const job = await prisma.jobListing.findUnique({
      where: { id: context.params.id },
      select: {
        id: true,
        jobTitle: true,
        businessName: true,
        city: true,
        status: true,
        employerAccessHash: true,
        applications: {
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            applicantName: true,
            phone: true,
            experience: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });
    if (!job) return NextResponse.json({ error: "الإعلان غير موجود." }, { status: 404 });

    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
    if (!validToken(token, job.employerAccessHash)) {
      return NextResponse.json({ error: "رابط المتابعة غير صالح. استخدم الرمز الذي ظهر عند نشر الإعلان." }, { status: 401 });
    }

    const { employerAccessHash: _privateHash, ...privateJob } = job;
    return NextResponse.json(
      { job: privateJob },
      { headers: { "Cache-Control": "no-store, private", "Vary": "Authorization" } },
    );
  } catch {
    return NextResponse.json({ error: "تعذر تحميل طلبات المتقدمين." }, { status: 503 });
  }
}
