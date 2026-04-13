import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const apps = await prisma.rentalApplication.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(apps.map((a) => ({
      id: a.id, firstName: a.firstName, lastName: a.lastName,
      email: a.email, phone: a.phone, currentAddress: a.currentAddress,
      employer: a.employer, income: a.income, moveInDate: a.moveInDate,
      desiredUnit: a.desiredUnit, message: a.message, status: a.status,
      reviewedBy: a.reviewedBy, reviewNotes: a.reviewNotes,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("GET applications error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const app = await prisma.rentalApplication.create({
      data: {
        firstName: body.firstName, lastName: body.lastName,
        email: body.email, phone: body.phone,
        currentAddress: body.currentAddress, employer: body.employer,
        income: body.income ? parseFloat(body.income) : null,
        moveInDate: body.moveInDate, desiredUnit: body.desiredUnit,
        message: body.message,
      },
    });
    return NextResponse.json({ id: app.id }, { status: 201 });
  } catch (error) {
    console.error("POST application error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, reviewedBy, reviewNotes } = body;
    await prisma.rentalApplication.update({
      where: { id },
      data: { status, reviewedBy, reviewNotes },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH application error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
