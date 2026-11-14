import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
export const BENEFICIARY_COOKIE="humanity_beneficiary_session";
export async function getBeneficiarySession(){
 const secret=process.env.JWT_SECRET;if(!secret)return null;
 const token=cookies().get(BENEFICIARY_COOKIE)?.value;if(!token)return null;
 try{const p=jwt.verify(token,secret) as {sub?:string;kind?:string};if(!p.sub||p.kind!=="beneficiary")return null;return await prisma.user.findUnique({where:{id:p.sub},select:{id:true,email:true,name:true,role:true}})}catch{return null}
}
export function createBeneficiaryToken(id:string){const secret=process.env.JWT_SECRET;if(!secret)throw new Error("JWT_SECRET missing");return jwt.sign({kind:"beneficiary"},secret,{subject:id,expiresIn:"14d"})}
