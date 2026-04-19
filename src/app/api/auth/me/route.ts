import { NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";

export async function GET() {
  const user = await getAuthFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    id: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    unit: user.unit,
  });
}
