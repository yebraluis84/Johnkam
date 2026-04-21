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
      dateOfBirth: a.dateOfBirth, ssnLast4: a.ssnLast4,
      consentGiven: a.consentGiven,
      screeningStatus: a.screeningStatus, screeningResult: a.screeningResult,
      screeningDate: a.screeningDate?.toISOString() || null,
      creditScore: a.creditScore, criminalClear: a.criminalClear,
      evictionClear: a.evictionClear, identityVerified: a.identityVerified,
      incomeVerified: a.incomeVerified, employmentVerified: a.employmentVerified,
      landlordReference: a.landlordReference, landlordRefVerified: a.landlordRefVerified,
      screeningScore: a.screeningScore, screeningNotes: a.screeningNotes,
      convertedToTenantId: a.convertedToTenantId,
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
        dateOfBirth: body.dateOfBirth || null,
        ssnLast4: body.ssnLast4 || null,
        consentGiven: body.consentGiven === true,
      },
    });
    return NextResponse.json({ id: app.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("POST application error:", message);
    return NextResponse.json({ error: message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const allowed = [
      "status", "reviewedBy", "reviewNotes",
      "incomeVerified", "employmentVerified",
      "landlordReference", "landlordRefVerified",
      "screeningScore", "screeningNotes", "convertedToTenantId",
    ];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in fields) data[key] = fields[key];
    }

    await prisma.rentalApplication.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH application error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
