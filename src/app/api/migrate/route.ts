import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const results: string[] = [];

    const columns = [
      { name: "bankName", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "bankAccountHolder", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "bankRoutingNumber", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "bankAccountNumber", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "bankAccountType", type: "TEXT NOT NULL DEFAULT 'checking'" },
      { name: "zelleEmail", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "paymentInstructions", type: "TEXT NOT NULL DEFAULT ''" },
    ];

    for (const col of columns) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "properties" ADD COLUMN "${col.name}" ${col.type}`
        );
        results.push(`Added ${col.name}`);
      } catch {
        results.push(`${col.name} already exists`);
      }
    }

    return NextResponse.json({ message: "Migration complete", results });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
