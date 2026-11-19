import { createHash, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const hashCode = (userId: string, code: string) =>
  createHash("sha256").update(userId + ":" + code).digest("hex");

export async function issueEmailVerificationCode(userId: string, email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.emailVerificationCode.upsert({
    where: { userId },
    create: { userId, codeHash: hashCode(userId, code), expiresAt, attempts: 0 },
    update: { codeHash: hashCode(userId, code), expiresAt, attempts: 0, createdAt: new Date() },
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [email], subject: "رمز تأكيد بريدك الإلكتروني - HUMANITY ONE",
      text: `رمز تأكيد بريدك الإلكتروني هو: ${code}. صالح لمدة 10 دقائق ويستخدم مرة واحدة فقط.`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.9"><h2>تأكيد البريد الإلكتروني</h2><p>رمز التأكيد الخاص بك:</p><strong style="font-size:28px;letter-spacing:6px">${code}</strong><p>الرمز صالح لمدة 10 دقائق ويستخدم مرة واحدة فقط. لا تشاركه مع أي شخص.</p></div>`,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    await prisma.emailVerificationCode.deleteMany({ where: { userId } });
    return false;
  }
  return true;
}

export async function consumeEmailVerificationCode(userId: string, suppliedCode: string) {
  const record = await prisma.emailVerificationCode.findUnique({ where: { userId } });
  if (!record || record.expiresAt <= new Date() || record.attempts >= 5 || !/^\\d{6}$/.test(suppliedCode)) return false;
  const actual = Buffer.from(hashCode(userId, suppliedCode));
  const expected = Buffer.from(record.codeHash);
  const valid = actual.length === expected.length && timingSafeEqual(actual, expected);
  if (!valid) {
    await prisma.emailVerificationCode.update({ where: { userId }, data: { attempts: { increment: 1 } } });
    return false;
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationCode.delete({ where: { userId } }),
  ]);
  return true;
}
