import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrganizationSession } from "@/lib/organization-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const orgSelect = { id: true, name: true, country: true, focusArea: true } as const;

export async function GET(req: NextRequest) {
  const organization = await getOrganizationSession();
  if (!organization) return NextResponse.json({ error: "سجّل الدخول بحساب منظمتك المعتمد." }, { status: 401 });
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  try {
    const conversations = await prisma.organizationConversation.findMany({
      where: { OR: [{ organizationAId: organization.id }, { organizationBId: organization.id }] },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        organizationA: { select: orgSelect },
        organizationB: { select: orgSelect },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, senderOrganizationId: true } },
      },
    });
    let selected = null;
    if (conversationId) {
      selected = await prisma.organizationConversation.findFirst({
        where: { id: conversationId, OR: [{ organizationAId: organization.id }, { organizationBId: organization.id }] },
        include: {
          organizationA: { select: orgSelect },
          organizationB: { select: orgSelect },
          messages: { orderBy: { createdAt: "asc" }, take: 300, include: { senderOrganization: { select: { id: true, name: true } } } },
        },
      });
      if (!selected) return NextResponse.json({ error: "المحادثة غير موجودة أو لا تملك صلاحية الوصول إليها." }, { status: 404 });
    }
    const directory = await prisma.organization.findMany({
      where: { status: "ACTIVE", id: { not: organization.id }, passwordHash: { not: null } },
      orderBy: { name: "asc" },
      select: orgSelect,
      take: 200,
    });
    return NextResponse.json({ organization, conversations, selected, directory }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل المراسلات حاليًا." }, { status: 503 });
  }
}

const schema = z.object({
  body: z.string().trim().min(1).max(5000),
  conversationId: z.string().min(1).optional(),
  recipientOrganizationId: z.string().min(1).optional(),
  subject: z.string().trim().min(3).max(140).optional(),
});

export async function POST(req: NextRequest) {
  const organization = await getOrganizationSession();
  if (!organization) return NextResponse.json({ error: "سجّل الدخول بحساب منظمتك المعتمد." }, { status: 401 });
  const limit = await rateLimit(req, "organization-message", 60, 60 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "اكتب رسالة صحيحة، وحدد محادثة قائمة أو منظمة مستقبلة وموضوعًا." }, { status: 400 });
  try {
    let conversationId = parsed.data.conversationId;
    if (conversationId) {
      const conversation = await prisma.organizationConversation.findFirst({
        where: { id: conversationId, OR: [{ organizationAId: organization.id }, { organizationBId: organization.id }] },
        select: { id: true },
      });
      if (!conversation) return NextResponse.json({ error: "لا تملك صلاحية إرسال رسالة في هذه المحادثة." }, { status: 403 });
    } else {
      const recipientId = parsed.data.recipientOrganizationId;
      if (!recipientId || !parsed.data.subject) return NextResponse.json({ error: "اختر منظمة مستقبلة واكتب موضوع المحادثة." }, { status: 400 });
      const recipient = await prisma.organization.findFirst({
        where: { id: recipientId, status: "ACTIVE", passwordHash: { not: null } },
        select: { id: true },
      });
      if (!recipient || recipient.id === organization.id) return NextResponse.json({ error: "المنظمة المستقبلة غير متاحة." }, { status: 404 });
      const conversation = await prisma.organizationConversation.create({
        data: {
          subject: parsed.data.subject,
          organizationAId: organization.id,
          organizationBId: recipient.id,
        },
        select: { id: true },
      });
      conversationId = conversation.id;
    }
    const message = await prisma.organizationMessage.create({
      data: { conversationId, senderOrganizationId: organization.id, body: parsed.data.body },
      select: { id: true, body: true, createdAt: true },
    });
    await prisma.organizationConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return NextResponse.json({ ok: true, conversationId, message }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "تعذر إرسال الرسالة. حاول مرة أخرى." }, { status: 503 });
  }
}
