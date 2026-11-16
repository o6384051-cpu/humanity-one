import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  organizationName: z.string().trim().min(3).max(160),
  contactName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  country: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  category: z.enum(["الإغاثة والمساندة الإنسانية", "التعليم والتدريب", "العمل والتمكين الاقتصادي", "الصحة والتعافي المجتمعي"]),
  website: z.string().trim().max(300).optional().or(z.literal("")),
  areas: z.string().trim().min(5).max(500),
  description: z.string().trim().min(20).max(2500),
  consent: z.literal(true),
});

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "organization-application", 5, 86400000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, Boolean(limit.unavailable));

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "راجع البيانات المطلوبة وتأكد من الموافقة على معالجة بيانات التواصل." }, { status: 400 });

  const data = parsed.data;
  const body = [
    "طلب انضمام منظمة جديد إلى شبكة HUMANITY ONE",
    "",
    "الاسم القانوني: " + data.organizationName,
    "مسؤول التواصل: " + data.contactName,
    "البريد الرسمي: " + data.email,
    "البلد: " + data.country,
    "المدينة: " + data.city,
    "المجال: " + data.category,
    "الموقع: " + (data.website || "لم يُذكر"),
    "مجالات العمل: " + data.areas,
    "",
    "نبذة ونطاق الخدمات:",
    data.description,
    "",
    "الموافقة: وافق مقدم الطلب على استخدام بيانات التواصل لمراجعة الطلب.",
  ].join("\n");

  try {
    const application = await prisma.mailMessage.create({
      data: {
        senderName: data.organizationName,
        senderEmail: data.email.toLowerCase(),
        department: "partners",
        subject: "طلب انضمام منظمة: " + data.organizationName,
        body,
        status: "NEW",
        direction: "INBOUND",
      },
      select: { id: true, createdAt: true, status: true },
    });
    return NextResponse.json({
      application,
      message: "تم تسجيل طلبك داخل HUMANITY ONE، وسيظهر لفريق الإدارة للمراجعة والتحقق. تسجيل الطلب لا يعني اعتماده.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "تعذر حفظ الطلب حاليًا. حاول مرة أخرى لاحقًا أو تواصل عبر humanityone.contact@gmail.com." }, { status: 503 });
  }
}
