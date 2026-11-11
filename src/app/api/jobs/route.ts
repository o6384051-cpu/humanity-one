import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listingSchema = z.object({
  employerName: z.string().trim().min(2).max(100),
  businessType: z.enum(["مصنع", "ورشة", "مطعم", "شركة", "محل تجاري", "مقاول", "مزرعة", "أخرى"]),
  businessName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().max(100).optional().default(""),
  contactPhone: z.string().trim().regex(/^[+0-9٠-٩\s()-]{8,22}$/),
  contactEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  jobTitle: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(2500),
  skills: z.string().trim().max(500).optional().default(""),
  experienceLevel: z.enum(["لا يشترط خبرة", "حديث الخبرة", "خبرة سنة إلى 3 سنوات", "خبرة أكثر من 3 سنوات"]),
  educationRequirement: z.enum(["لا يشترط مؤهل", "إعدادية أو أقل", "دبلوم فني", "مؤهل متوسط", "مؤهل عالٍ", "حسب متطلبات المهنة"]),
  salaryMin: z.number().int().min(0).max(10000000).nullable().optional(),
  salaryMax: z.number().int().min(0).max(10000000).nullable().optional(),
  salaryPeriod: z.enum(["يومي", "أسبوعي", "شهري", "حسب الاتفاق"]),
  employmentType: z.enum(["دوام كامل", "دوام جزئي", "عمل يومي", "مؤقت", "بالقطعة"]),
  shift: z.string().trim().max(100).optional().default(""),
  openings: z.number().int().min(1).max(500),
  website: z.string().optional().default(""),
}).refine((data) => !data.salaryMin || !data.salaryMax || data.salaryMax >= data.salaryMin, {
  message: "الحد الأعلى للأجر يجب ألا يقل عن الحد الأدنى.",
  path: ["salaryMax"],
});

export async function GET() {
  try {
    const jobs = await prisma.jobListing.findMany({
      where: {
        status: "APPROVED",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, businessType: true, businessName: true, city: true, area: true,
        jobTitle: true, description: true, skills: true, experienceLevel: true,
        educationRequirement: true, salaryMin: true, salaryMax: true,
        salaryPeriod: true, employmentType: true, shift: true, openings: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ error: "خدمة الوظائف غير متصلة بقاعدة البيانات حاليًا." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = listingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "راجع البيانات المدخلة." }, { status: 400 });
    }
    if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 202 });
    const data = parsed.data;
    if (data.salaryMin != null && data.salaryMax != null && data.salaryMax < data.salaryMin) {
      return NextResponse.json({ error: "الحد الأعلى للأجر يجب ألا يقل عن الحد الأدنى." }, { status: 400 });
    }
    const job = await prisma.jobListing.create({
      data: {
        employerName: data.employerName, businessType: data.businessType,
        businessName: data.businessName, city: data.city, area: data.area || null,
        contactPhone: data.contactPhone, contactEmail: data.contactEmail || null,
        jobTitle: data.jobTitle, description: data.description, skills: data.skills || null,
        experienceLevel: data.experienceLevel, educationRequirement: data.educationRequirement,
        salaryMin: data.salaryMin ?? null, salaryMax: data.salaryMax ?? null,
        salaryPeriod: data.salaryPeriod, employmentType: data.employmentType,
        shift: data.shift || null, openings: data.openings, status: "PENDING",
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: job.id, status: "PENDING", message: "وصل إعلانك وسيظهر بعد مراجعته." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذر حفظ الإعلان. تأكد من اتصال قاعدة البيانات ثم حاول مجددًا." }, { status: 503 });
  }
}
