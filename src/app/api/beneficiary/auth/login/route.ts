import {NextRequest,NextResponse} from "next/server";import bcrypt from "bcryptjs";import {z} from "zod";import {prisma} from "@/lib/prisma";import {BENEFICIARY_COOKIE,createBeneficiaryToken} from "@/lib/beneficiary-auth";import {rateLimit,rateLimitResponse} from "@/lib/rate-limit";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const l=rateLimit(req,"beneficiary-login",8,900000);if(!l.allowed)return rateLimitResponse(l.retryAfter);if(!process.env.JWT_SECRET)return NextResponse.json({error:"إعدادات الدخول غير مكتملة."},{status:503});
 try{const s=z.object({email:z.string().email().max(160),password:z.string().min(1).max(128)}).safeParse(await req.json());if(!s.success)return NextResponse.json({error:"أدخل البريد وكلمة المرور."},{status:400});
 const u=await prisma.user.findUnique({where:{email:s.data.email.toLowerCase()}});if(!u||!(await bcrypt.compare(s.data.password,u.passwordHash)))return NextResponse.json({error:"بيانات الدخول غير صحيحة."},{status:401});
 const res=NextResponse.json({user:{id:u.id,name:u.name,email:u.email,role:u.role}},{headers:{"Cache-Control":"no-store"}});res.cookies.set(BENEFICIARY_COOKIE,createBeneficiaryToken(u.id),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:1209600});return res;
 }catch{return NextResponse.json({error:"تعذر تسجيل الدخول."},{status:503})}
}