import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, amount, description } = await req.json();

    if (!tenantId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Missing tenantId or valid amount" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: tenant.user.email,
        name: tenant.user.name,
        metadata: { tenantId: tenant.id, unitId: tenant.unitId || "" },
      });
      customerId = customer.id;
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customerId,
      description: description || "Rent Payment",
      metadata: { tenantId, description: description || "Rent Payment" },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe create-intent error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
