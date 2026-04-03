import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendCustomNotification } from "@/lib/email";

export async function GET() {
  try {
    const logs = await prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(
      logs.map((l) => ({
        id: l.id,
        templateName: l.templateName,
        recipient: l.recipient,
        email: l.email,
        subject: l.subject,
        status: l.status,
        channel: l.channel,
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET notifications error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, message, recipients } = body;

    const property = await prisma.property.findFirst();
    const propertyName = property?.name || "TenantHub";

    // Get tenant emails
    let emails: { email: string; name: string }[] = [];

    if (recipients === "all") {
      const tenants = await prisma.tenant.findMany({
        where: { status: { in: ["ACTIVE", "PENDING"] } },
        include: { user: true },
      });
      emails = tenants.map((t) => ({ email: t.user.email, name: t.user.name }));
    } else if (Array.isArray(recipients)) {
      const users = await prisma.user.findMany({
        where: { id: { in: recipients } },
      });
      emails = users.map((u) => ({ email: u.email, name: u.name }));
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    const result = await sendCustomNotification({
      to: emails.map((e) => e.email),
      subject,
      message,
      propertyName,
    });

    // Log each notification
    await Promise.all(
      emails.map((e) =>
        prisma.notificationLog.create({
          data: {
            templateName: "Custom Notification",
            recipient: e.name,
            email: e.email,
            subject,
            status: result.success ? "delivered" : "failed",
            channel: "email",
          },
        })
      )
    );

    return NextResponse.json({
      success: result.success,
      sent: emails.length,
    }, { status: 201 });
  } catch (error) {
    console.error("POST notification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
