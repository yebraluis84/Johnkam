import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Simulated background screening - in production, integrate with a real provider
// like TransUnion SmartMove, RentPrep, or Checkr
export async function POST(req: NextRequest) {
  try {
    const { applicationId } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: "applicationId required" }, { status: 400 });
    }

    const app = await prisma.rentalApplication.findUnique({ where: { id: applicationId } });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!app.consentGiven) {
      return NextResponse.json({ error: "Applicant has not consented to screening" }, { status: 400 });
    }

    // Mark as in-progress
    await prisma.rentalApplication.update({
      where: { id: applicationId },
      data: { screeningStatus: "in_progress" },
    });

    // Simulate screening delay then generate results
    const creditScore = Math.floor(Math.random() * 350) + 500; // 500–850
    const criminalClear = Math.random() > 0.1; // 90% clear
    const evictionClear = Math.random() > 0.15; // 85% clear
    const identityVerified = Math.random() > 0.05; // 95% verified

    const allClear = criminalClear && evictionClear && identityVerified && creditScore >= 620;
    const screeningResult = allClear ? "pass" : "review_needed";

    let score = 0;
    if (creditScore >= 750) score += 30;
    else if (creditScore >= 700) score += 25;
    else if (creditScore >= 650) score += 20;
    else if (creditScore >= 620) score += 15;
    else score += 5;
    if (criminalClear) score += 25;
    if (evictionClear) score += 25;
    if (identityVerified) score += 20;

    await prisma.rentalApplication.update({
      where: { id: applicationId },
      data: {
        screeningStatus: "completed",
        screeningResult,
        screeningDate: new Date(),
        creditScore,
        criminalClear,
        evictionClear,
        identityVerified,
        screeningScore: score,
      },
    });

    return NextResponse.json({
      success: true,
      result: screeningResult,
      creditScore,
      criminalClear,
      evictionClear,
      identityVerified,
      screeningScore: score,
    });
  } catch (error) {
    console.error("Screening error:", error);
    return NextResponse.json({ error: "Screening failed" }, { status: 500 });
  }
}
