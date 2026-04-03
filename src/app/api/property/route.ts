import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const property = await prisma.property.findFirst();
    if (!property) {
      return NextResponse.json({ error: "No property found" }, { status: 404 });
    }

    return NextResponse.json({
      id: property.id,
      name: property.name,
      address: property.address,
      city: property.city,
      totalUnits: property.totalUnits,
      paymentDueDay: property.paymentDueDay,
      lateFeeGraceDays: property.lateFeeGraceDays,
      lateFeeAmount: property.lateFeeAmount,
      acceptCreditCard: property.acceptCreditCard,
      acceptACH: property.acceptACH,
    });
  } catch (error) {
    console.error("GET property error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, address, city, totalUnits, paymentDueDay, lateFeeGraceDays, lateFeeAmount, acceptCreditCard, acceptACH } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (totalUnits !== undefined) data.totalUnits = totalUnits;
    if (paymentDueDay !== undefined) data.paymentDueDay = paymentDueDay;
    if (lateFeeGraceDays !== undefined) data.lateFeeGraceDays = lateFeeGraceDays;
    if (lateFeeAmount !== undefined) data.lateFeeAmount = lateFeeAmount;
    if (acceptCreditCard !== undefined) data.acceptCreditCard = acceptCreditCard;
    if (acceptACH !== undefined) data.acceptACH = acceptACH;

    let property;
    if (id) {
      property = await prisma.property.update({ where: { id }, data });
    } else {
      const existing = await prisma.property.findFirst();
      if (existing) {
        property = await prisma.property.update({ where: { id: existing.id }, data });
      } else {
        property = await prisma.property.create({
          data: {
            name: name || "My Property",
            address: address || "",
            city: city || "",
            totalUnits: totalUnits || 0,
          },
        });
      }
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("PUT property error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
