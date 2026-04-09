import { prisma } from "@/lib/db";

export async function logAudit(params: {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
