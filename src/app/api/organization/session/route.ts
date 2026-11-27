import {NextResponse} from "next/server";
import {getOrganizationSession} from "@/lib/organization-auth";
export const dynamic="force-dynamic";
export async function GET(){
 const session=await getOrganizationSession();
 if(!session)return NextResponse.json({error:"سجّل الدخول بحساب منظمتك."},{status:401});
 return NextResponse.json({organization:{id:session.id,name:session.name,email:session.email},actor:{type:session.actorType,memberId:session.memberId,role:session.memberRole,permissions:session.permissions}},{headers:{"Cache-Control":"private, no-store"}});
}
