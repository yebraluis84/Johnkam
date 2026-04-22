import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();
    if (!propertyId) {
      return NextResponse.json({ error: "propertyId required" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const stripe = getStripe();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    let accountId = property.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { propertyId: property.id, propertyName: property.name },
      });
      accountId = account.id;

      await prisma.property.update({
        where: { id: propertyId },
        data: { stripeAccountId: accountId },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/admin/settings?stripe=refresh`,
      return_url: `${origin}/admin/settings?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe Connect onboard error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    if (!propertyId) {
      return NextResponse.json({ error: "propertyId required" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || !property.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
        accountId: null,
      });
    }

    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(property.stripeAccountId);

    const onboarded = account.charges_enabled && account.payouts_enabled;

    if (onboarded && !property.stripeOnboarded) {
      await prisma.property.update({
        where: { id: propertyId },
        data: { stripeOnboarded: true },
      });
    }

    return NextResponse.json({
      connected: true,
      onboarded,
      accountId: property.stripeAccountId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      platformFeePercent: property.platformFeePercent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe Connect status error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
