import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

export async function sendTenantInvite(params: {
  to: string;
  tenantName: string;
  unit: string;
  propertyName: string;
  inviteCode?: string;
}) {
  const { to, tenantName, unit, propertyName, inviteCode } = params;
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const { data, error } = await getResend().emails.send({
      from: `${propertyName} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Welcome to ${propertyName} - Your Tenant Portal Invitation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e2e8f0;">
            <h1 style="color: #0f172a; margin: 0;">🏢 ${propertyName}</h1>
            <p style="color: #64748b; margin: 5px 0 0;">Tenant Portal</p>
          </div>

          <div style="padding: 30px 0;">
            <h2 style="color: #0f172a;">Welcome, ${tenantName}!</h2>
            <p style="color: #475569; line-height: 1.6;">
              You've been invited to join the tenant portal for <strong>${propertyName}</strong>.
              Your assigned unit is <strong>${unit}</strong>.
            </p>

            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 5px; color: #64748b; font-size: 14px;">Your Invitation Code:</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: 2px;">
                ${inviteCode || "WELCOME2026"}
              </p>
            </div>

            <p style="color: #475569; line-height: 1.6;">
              With the tenant portal you can:
            </p>
            <ul style="color: #475569; line-height: 1.8;">
              <li>Pay rent online via credit card or bank transfer</li>
              <li>Submit and track maintenance requests</li>
              <li>Access your lease documents</li>
              <li>Communicate with property management</li>
              <li>View community announcements</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${portalUrl}/register"
                 style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Create Your Account
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px;">
              ${propertyName} &middot; Powered by TenantHub
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email service error:", err);
    return { success: false, error: "Email service unavailable" };
  }
}

export async function sendPaymentConfirmation(params: {
  to: string;
  tenantName: string;
  amount: number;
  method: string;
  confirmationNumber: string;
  propertyName: string;
}) {
  const { to, tenantName, amount, method, confirmationNumber, propertyName } = params;

  try {
    const { data, error } = await getResend().emails.send({
      from: `${propertyName} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Payment Confirmation - $${amount.toFixed(2)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f172a;">Payment Received</h1>
          <p style="color: #475569;">Hi ${tenantName}, your payment has been processed successfully.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; color: #166534; font-size: 24px; font-weight: bold;">$${amount.toFixed(2)}</p>
            <p style="margin: 0; color: #166534;">Confirmation: ${confirmationNumber}</p>
            <p style="margin: 5px 0 0; color: #15803d; font-size: 14px;">Method: ${method}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">${propertyName} &middot; Powered by TenantHub</p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email service error:", err);
    return { success: false, error: "Email service unavailable" };
  }
}

export async function sendMaintenanceUpdate(params: {
  to: string;
  tenantName: string;
  ticketNumber: string;
  title: string;
  newStatus: string;
  propertyName: string;
}) {
  const { to, tenantName, ticketNumber, title, newStatus, propertyName } = params;

  try {
    const { data, error } = await getResend().emails.send({
      from: `${propertyName} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Maintenance Update - ${ticketNumber}: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f172a;">Maintenance Update</h1>
          <p style="color: #475569;">Hi ${tenantName}, your maintenance request has been updated.</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #0f172a;">${ticketNumber}: ${title}</p>
            <p style="margin: 10px 0 0; color: #2563eb; font-weight: 600;">New Status: ${newStatus.replace("_", " ").toUpperCase()}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">${propertyName} &middot; Powered by TenantHub</p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email service error:", err);
    return { success: false, error: "Email service unavailable" };
  }
}

export async function sendNewTicketAlert(params: {
  to: string[];
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  tenantName: string;
  unit: string;
  propertyName: string;
}) {
  const { to, ticketNumber, title, description, category, priority, tenantName, unit, propertyName } = params;
  if (!to.length) return { success: true, sent: 0 };

  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const priorityUpper = priority.toUpperCase();
  const isUrgent = priorityUpper === "URGENT" || priorityUpper === "HIGH";
  const priorityColor = priorityUpper === "URGENT"
    ? "#dc2626"
    : priorityUpper === "HIGH"
    ? "#ea580c"
    : priorityUpper === "MEDIUM"
    ? "#ca8a04"
    : "#64748b";

  try {
    const results = await Promise.all(
      to.map((email) =>
        getResend().emails.send({
          from: `${propertyName} <${FROM_EMAIL}>`,
          to: [email],
          subject: `${isUrgent ? "🚨 " : ""}New ${priorityUpper} Ticket - ${ticketNumber}: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e2e8f0;">
                <h1 style="color: #0f172a; margin: 0;">🔧 New Maintenance Request</h1>
                <p style="color: #64748b; margin: 5px 0 0;">${propertyName}</p>
              </div>

              <div style="padding: 30px 0;">
                <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 0 0 20px;">
                  <p style="margin: 0 0 5px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Ticket</p>
                  <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">${ticketNumber}: ${title}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 110px;">Priority:</td>
                    <td style="padding: 8px 0;"><span style="color: ${priorityColor}; font-weight: 600; font-size: 14px;">${priorityUpper}</span></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Category:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${category}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Tenant:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${tenantName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Unit:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${unit}</td>
                  </tr>
                </table>

                ${description ? `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 0 0 20px;">
                  <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Description</p>
                  <p style="margin: 0; color: #475569; line-height: 1.6; white-space: pre-wrap;">${description}</p>
                </div>
                ` : ""}

                <div style="text-align: center; margin: 30px 0 10px;">
                  <a href="${portalUrl}/staff/tickets"
                     style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                    View in Dashboard
                  </a>
                </div>
              </div>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">
                  ${propertyName} &middot; Powered by TenantHub
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                  You're receiving this because you have new-ticket alerts enabled. Manage in your staff settings.
                </p>
              </div>
            </div>
          `,
        })
      )
    );

    return { success: true, sent: results.length };
  } catch (err) {
    console.error("New ticket alert email error:", err);
    return { success: false, error: "Email service unavailable" };
  }
}

export async function sendTicketAssignmentAlert(params: {
  to: string;
  assigneeName: string;
  assignerName: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  tenantName: string;
  unit: string;
  propertyName: string;
}) {
  const {
    to, assigneeName, assignerName, ticketNumber, title, description,
    category, priority, tenantName, unit, propertyName,
  } = params;

  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const priorityUpper = priority.toUpperCase();
  const isUrgent = priorityUpper === "URGENT" || priorityUpper === "HIGH";
  const priorityColor = priorityUpper === "URGENT"
    ? "#dc2626"
    : priorityUpper === "HIGH"
    ? "#ea580c"
    : priorityUpper === "MEDIUM"
    ? "#ca8a04"
    : "#64748b";

  try {
    const { data, error } = await getResend().emails.send({
      from: `${propertyName} <${FROM_EMAIL}>`,
      to: [to],
      subject: `${isUrgent ? "🚨 " : ""}Assigned to you: ${ticketNumber} – ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e2e8f0;">
            <h1 style="color: #0f172a; margin: 0;">📋 Ticket Assigned to You</h1>
            <p style="color: #64748b; margin: 5px 0 0;">${propertyName}</p>
          </div>

          <div style="padding: 30px 0;">
            <p style="color: #0f172a; font-size: 16px; margin: 0 0 20px;">
              Hi ${assigneeName}, <strong>${assignerName}</strong> has assigned a maintenance ticket to you.
            </p>

            <div style="background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px; padding: 16px 20px; margin: 0 0 20px;">
              <p style="margin: 0 0 5px; color: #047857; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Your Ticket</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #064e3b;">${ticketNumber}: ${title}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 110px;">Priority:</td>
                <td style="padding: 8px 0;"><span style="color: ${priorityColor}; font-weight: 600; font-size: 14px;">${priorityUpper}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Category:</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Tenant:</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${tenantName || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Unit:</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${unit}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Assigned by:</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${assignerName}</td>
              </tr>
            </table>

            ${description ? `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 0 0 20px;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Description</p>
              <p style="margin: 0; color: #475569; line-height: 1.6; white-space: pre-wrap;">${description}</p>
            </div>
            ` : ""}

            <div style="text-align: center; margin: 30px 0 10px;">
              <a href="${portalUrl}/staff/tickets"
                 style="background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                View My Tickets
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              ${propertyName} &middot; Powered by TenantHub
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Assignment alert email error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Assignment alert email service error:", err);
    return { success: false, error: "Email service unavailable" };
  }
}

export async function sendCustomNotification(params: {
  to: string[];
  subject: string;
  message: string;
  propertyName: string;
}) {
  const { to, subject, message, propertyName } = params;

  try {
    const results = await Promise.all(
      to.map((email) =>
        getResend().emails.send({
          from: `${propertyName} <${FROM_EMAIL}>`,
          to: [email],
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #0f172a;">${subject}</h1>
              <div style="color: #475569; line-height: 1.6; white-space: pre-wrap;">${message}</div>
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">${propertyName} &middot; Powered by TenantHub</p>
            </div>
          `,
        })
      )
    );

    return { success: true, sent: results.length };
  } catch (err) {
    console.error("Email service error:", err);
    return { success: false, error: "Email service unavailable" };
  }
}

export async function sendLeaseDocument(params: {
  to: string;
  tenantName: string;
  documentName: string;
  propertyName: string;
  signUrl: string;
}) {
  const { to, tenantName, documentName, propertyName, signUrl } = params;

  try {
    const { data, error } = await getResend().emails.send({
      from: `${propertyName} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Lease Document Ready for Signature - ${documentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e2e8f0;">
            <h1 style="color: #0f172a; margin: 0;">${propertyName}</h1>
            <p style="color: #64748b; margin: 5px 0 0;">Lease Document</p>
          </div>
          <div style="padding: 30px 0;">
            <h2 style="color: #0f172a;">Hello, ${tenantName}</h2>
            <p style="color: #475569; line-height: 1.6;">
              A lease document has been prepared for you and is ready for your electronic signature.
            </p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 5px; color: #64748b; font-size: 14px;">Document:</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">${documentName}</p>
            </div>
            <p style="color: #475569; line-height: 1.6;">
              Please review the document carefully before signing.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signUrl}" style="background: #2563eb; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">
                Review &amp; Sign Document
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; text-align: center;">
              This link is unique to you. Do not share it with others.
            </p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px;">${propertyName} &middot; Powered by TenantHub</p>
          </div>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email service error:", err);
    return { success: false, error: "Email service unavailable" };
  }
}
