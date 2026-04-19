import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendCustomNotification } from "@/lib/email";
import { logAudit } from "@/lib/audit";

async function handleSuccessfulPayment(tenantId: string, amount: number, description: string, stripeId: string) {
  const confirmationNumber = `PAY-${Date.now().toString(36).toUpperCase()}`;

  await prisma.payment.create({
    data: {
      amount,
      description,
      method: "CREDIT_CARD",
      status: "COMPLETED",
      confirmationNumber,
      stripePaymentIntent: stripeId,
      tenantId,
    },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { user: true },
  });

  if (tenant) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { balance: { decrement: amount } },
    });

    const property = await prisma.property.findFirst();
    try {
      await sendCustomNotification({
        to: [tenant.user.email],
        subject: `Payment Confirmed - ${confirmationNumber}`,
        message: `Hi ${tenant.user.name},\n\nYour payment of $${amount.toFixed(2)} has been received.\n\nConfirmation: ${confirmationNumber}\nDescription: ${description}\n\nThank you!`,
        propertyName: property?.name || "TenantHub",
      });
    } catch {}

    logAudit({
      action: "payment",
      entity: "payment",
      entityId: confirmationNumber,
      details: `$${amount.toFixed(2)} via Stripe (${stripeId})`,
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const tenantId = session.metadata?.tenantId;
    const description = session.metadata?.description || "Rent Payment";
    const amount = (session.amount_total || 0) / 100;

    if (tenantId && amount > 0) {
      await handleSuccessfulPayment(tenantId, amount, description, session.payment_intent as string || session.id);
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const tenantId = pi.metadata.tenantId;
    if (!tenantId) return NextResponse.json({ received: true });

    const existing = await prisma.payment.findFirst({
      where: { stripePaymentIntent: pi.id },
    });
    if (existing) return NextResponse.json({ received: true });

    const description = pi.metadata.description || "Rent Payment";
    const amount = pi.amount / 100;
    await handleSuccessfulPayment(tenantId, amount, description, pi.id);
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    const tenantId = pi.metadata.tenantId;
    if (tenantId) {
      await prisma.payment.create({
        data: {
          amount: pi.amount / 100,
          description: pi.metadata.description || "Rent Payment",
          method: "CREDIT_CARD",
          status: "FAILED",
          stripePaymentIntent: pi.id,
          tenantId,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
