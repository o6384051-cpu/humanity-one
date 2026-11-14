import {NextRequest,NextResponse} from "next/server";import bcrypt from "bcryptjs";import {z} from "zod";import {prisma} from "@/lib/prisma";import {BENEFICIARY_COOKIE,createBeneficiaryToken} from "@/lib/beneficiary-auth";import {rateLimit,rateLimitResponse} from "@/lib/rate-limit";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const l=rateLimit(req,"beneficiary-register",5,3600000);if(!l.allowed)return rateLimitResponse(l.retryAfter);
 if(!process.env.JWT_SECRET)return NextResponse.json({error:"إعدادات الدخول غير مكتملة."},{status:503});
 try{const s=z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email().max(160),password:z.string().min(10).max(128)}).safeParse(await req.json());if(!s.success)return NextResponse.json({error:"أدخل اسمًا وبريدًا صحيحًا وكلمة مرور من 10 أحرف على الأقل."},{status:400});
 const u=await prisma.user.create({data:{name:s.data.name,email:s.data.email.toLowerCase(),passwordHash:await bcrypt.hash(s.data.password,12),role:"USER"},select:{id:true,name:true,email:true,role:true}});
 const res=NextResponse.json({user:u},{status:201,headers:{"Cache-Control":"no-store"}});res.cookies.set(BENEFICIARY_COOKIE,createBeneficiaryToken(u.id),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:1209600});return res;
 }catch(e:any){if(e?.code==="P2002")return NextResponse.json({error:"هذا البريد مسجل بالفعل."},{status:409});return NextResponse.json({error:"تعذر إنشاء الحساب."},{status:503})}
}