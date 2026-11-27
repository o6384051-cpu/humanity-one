import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getAdminSession} from "@/lib/admin-auth";
export const dynamic="force-dynamic";
export async function GET(){
 const actor=await getAdminSession();
 if(!actor||!["ADMIN","MODERATOR"].includes(actor.role))return NextResponse.json({error:"هذه المساحة للمشرفين المعتمدين فقط."},{status:403});
 const [organizations,pendingAssistance,jobsPending]=await Promise.all([prisma.organization.count(),prisma.assistanceRequest.count({where:{status:"PENDING"}}),prisma.jobListing.count({where:{status:"PENDING"}})]);
 return NextResponse.json({actor:{name:actor.name,email:actor.email,role:actor.role},stats:{organizations,pendingAssistance,jobsPending}},{headers:{"Cache-Control":"no-store, private"}});
}
