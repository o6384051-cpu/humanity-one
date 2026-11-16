import { NextResponse } from "next/server";
import { ORGANIZATION_COOKIE } from "@/lib/organization-auth";
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ORGANIZATION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
