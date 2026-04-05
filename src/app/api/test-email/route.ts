import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json({ error: "Please provide a 'to' email address" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

    // Show config (redact API key)
    const config = {
      apiKeySet: !!apiKey && apiKey !== "re_placeholder",
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + "..." : "NOT SET",
      fromEmail,
      toEmail: to,
    };

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: `TenantHub <${fromEmail}>`,
      to: [to],
      subject: "TenantHub - Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email Works!</h1>
          <p>If you're reading this, your email setup is working correctly.</p>
          <p style="color: #64748b; font-size: 12px;">Sent from TenantHub</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        config,
        error: error,
      });
    }

    return NextResponse.json({
      success: true,
      config,
      emailId: data?.id,
      message: "Email sent! Check your inbox (and spam folder).",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
