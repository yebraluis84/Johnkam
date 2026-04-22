import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, amount, description } = await req.json();

    if (!tenantId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Missing tenantId or valid amount" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true, unit: { include: { property: true } } },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const stripe = getStripe();

    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.user.email,
        name: tenant.user.name,
        metadata: { tenantId: tenant.id },
      });
      customerId = customer.id;
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const amountCents = Math.round(amount * 100);

    const property = tenant.unit?.property;
    const connectedAccountId = property?.stripeAccountId;
    const isOnboarded = property?.stripeOnboarded;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description || "Rent Payment",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payments`,
      metadata: { tenantId, description: description || "Rent Payment" },
    };

    if (connectedAccountId && isOnboarded) {
      const feePercent = property.platformFeePercent ?? 2.5;
      const applicationFee = Math.round(amountCents * (feePercent / 100));

      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: connectedAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
