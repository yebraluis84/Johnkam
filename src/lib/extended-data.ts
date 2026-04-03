// Lease Renewal Data
export interface LeaseRenewal {
  id: string;
  tenantName: string;
  unit: string;
  currentLeaseEnd: string;
  newLeaseStart: string;
  newLeaseEnd: string;
  currentRent: number;
  proposedRent: number;
  status: "pending" | "offered" | "accepted" | "declined" | "expired";
  offeredDate?: string;
  respondedDate?: string;
}

export const leaseRenewals: LeaseRenewal[] = [
  {
    id: "lr-001",
    tenantName: "Sarah Johnson",
    unit: "4B",
    currentLeaseEnd: "2026-07-31",
    newLeaseStart: "2026-08-01",
    newLeaseEnd: "2027-07-31",
    currentRent: 1850,
    proposedRent: 1850,
    status: "offered",
    offeredDate: "2026-04-01",
  },
  {
    id: "lr-002",
    tenantName: "Priya Patel",
    unit: "3A",
    currentLeaseEnd: "2026-02-28",
    newLeaseStart: "2026-03-01",
    newLeaseEnd: "2027-02-28",
    currentRent: 1750,
    proposedRent: 1800,
    status: "accepted",
    offeredDate: "2025-12-15",
    respondedDate: "2025-12-28",
  },
  {
    id: "lr-003",
    tenantName: "Marcus Chen",
    unit: "2A",
    currentLeaseEnd: "2026-05-31",
    newLeaseStart: "2026-06-01",
    newLeaseEnd: "2027-05-31",
    currentRent: 1650,
    proposedRent: 1700,
    status: "pending",
  },
];

// Vacancy Data
export interface VacantUnit {
  id: string;
  unit: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rent: number;
  availableDate: string;
  status: "available" | "reserved" | "maintenance";
  features: string[];
  lastTenant?: string;
  lastMoveOut?: string;
}

export const vacantUnits: VacantUnit[] = [
  {
    id: "vu-1",
    unit: "1A",
    floor: 1,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 650,
    rent: 1350,
    availableDate: "2026-04-01",
    status: "available",
    features: ["Patio", "Updated Kitchen", "In-Unit Washer/Dryer"],
    lastTenant: "Robert Mills",
    lastMoveOut: "2026-03-15",
  },
  {
    id: "vu-2",
    unit: "3B",
    floor: 3,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 950,
    rent: 1950,
    availableDate: "2026-04-15",
    status: "maintenance",
    features: ["Balcony", "Walk-In Closet", "Hardwood Floors", "City View"],
    lastTenant: "Ana Martinez",
    lastMoveOut: "2026-03-31",
  },
  {
    id: "vu-3",
    unit: "6A",
    floor: 6,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 875,
    rent: 1850,
    availableDate: "2026-05-01",
    status: "reserved",
    features: ["Rooftop Access", "Updated Bathroom", "Hardwood Floors"],
  },
];

// Reports Data
export interface MonthlyReport {
  month: string;
  revenue: number;
  collected: number;
  expenses: number;
  netIncome: number;
  occupancyRate: number;
  maintenanceRequests: number;
  avgResponseTime: number; // hours
}

export const monthlyReports: MonthlyReport[] = [
  { month: "2026-03", revenue: 42350, collected: 40500, expenses: 12800, netIncome: 27700, occupancyRate: 87.5, maintenanceRequests: 8, avgResponseTime: 18 },
  { month: "2026-02", revenue: 42350, collected: 41200, expenses: 11500, netIncome: 29700, occupancyRate: 87.5, maintenanceRequests: 5, avgResponseTime: 14 },
  { month: "2026-01", revenue: 42350, collected: 42350, expenses: 15200, netIncome: 27150, occupancyRate: 91.7, maintenanceRequests: 12, avgResponseTime: 22 },
  { month: "2025-12", revenue: 40500, collected: 39800, expenses: 13100, netIncome: 26700, occupancyRate: 91.7, maintenanceRequests: 6, avgResponseTime: 16 },
  { month: "2025-11", revenue: 40500, collected: 40500, expenses: 10900, netIncome: 29600, occupancyRate: 91.7, maintenanceRequests: 4, avgResponseTime: 12 },
  { month: "2025-10", revenue: 40500, collected: 40100, expenses: 14300, netIncome: 25800, occupancyRate: 91.7, maintenanceRequests: 9, avgResponseTime: 20 },
];

// Notification Templates
export interface NotificationTemplate {
  id: string;
  name: string;
  type: "payment_reminder" | "late_notice" | "lease_renewal" | "maintenance" | "announcement" | "welcome";
  subject: string;
  description: string;
  enabled: boolean;
  lastSent?: string;
  recipientCount?: number;
}

export const notificationTemplates: NotificationTemplate[] = [
  {
    id: "nt-1",
    name: "Rent Due Reminder",
    type: "payment_reminder",
    subject: "Rent Payment Due on {due_date}",
    description: "Sent 3 days before rent is due",
    enabled: true,
    lastSent: "2026-03-29",
    recipientCount: 21,
  },
  {
    id: "nt-2",
    name: "Late Payment Notice",
    type: "late_notice",
    subject: "Past Due Notice - {amount} Outstanding",
    description: "Sent when payment is 5+ days late",
    enabled: true,
    lastSent: "2026-04-01",
    recipientCount: 2,
  },
  {
    id: "nt-3",
    name: "Lease Renewal Offer",
    type: "lease_renewal",
    subject: "Your Lease Renewal Offer for Unit {unit}",
    description: "Sent 90 days before lease expiration",
    enabled: true,
    lastSent: "2026-03-15",
    recipientCount: 3,
  },
  {
    id: "nt-4",
    name: "Maintenance Update",
    type: "maintenance",
    subject: "Update on Your Maintenance Request #{ticket_id}",
    description: "Sent when ticket status changes",
    enabled: true,
    lastSent: "2026-03-30",
    recipientCount: 4,
  },
  {
    id: "nt-5",
    name: "Community Announcement",
    type: "announcement",
    subject: "{title}",
    description: "Broadcast announcements to all tenants",
    enabled: true,
    lastSent: "2026-04-01",
    recipientCount: 21,
  },
  {
    id: "nt-6",
    name: "Welcome Email",
    type: "welcome",
    subject: "Welcome to {property_name}!",
    description: "Sent when a new tenant account is created",
    enabled: true,
    lastSent: "2026-01-15",
    recipientCount: 1,
  },
];

export interface NotificationLog {
  id: string;
  templateName: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: "delivered" | "opened" | "bounced" | "pending";
  channel: "email" | "sms" | "push";
}

export const notificationLogs: NotificationLog[] = [
  { id: "nl-1", templateName: "Rent Due Reminder", recipient: "Sarah Johnson", subject: "Rent Payment Due on April 1", sentAt: "2026-03-29T08:00:00", status: "opened", channel: "email" },
  { id: "nl-2", templateName: "Rent Due Reminder", recipient: "Marcus Chen", subject: "Rent Payment Due on April 1", sentAt: "2026-03-29T08:00:00", status: "delivered", channel: "email" },
  { id: "nl-3", templateName: "Late Payment Notice", recipient: "Emily Rodriguez", subject: "Past Due Notice - $4,200 Outstanding", sentAt: "2026-04-01T09:00:00", status: "opened", channel: "email" },
  { id: "nl-4", templateName: "Maintenance Update", recipient: "Sarah Johnson", subject: "Update on Your Maintenance Request #MT-1024", sentAt: "2026-03-30T14:00:00", status: "opened", channel: "email" },
  { id: "nl-5", templateName: "Community Announcement", recipient: "All Tenants", subject: "Water Shut-Off Notice - April 5th", sentAt: "2026-04-01T10:00:00", status: "delivered", channel: "email" },
  { id: "nl-6", templateName: "Lease Renewal Offer", recipient: "Sarah Johnson", subject: "Your Lease Renewal Offer for Unit 4B", sentAt: "2026-04-01T09:00:00", status: "opened", channel: "email" },
  { id: "nl-7", templateName: "Rent Due Reminder", recipient: "Emily Rodriguez", subject: "Rent Payment Due on April 1", sentAt: "2026-03-29T08:00:00", status: "bounced", channel: "email" },
  { id: "nl-8", templateName: "Rent Due Reminder", recipient: "James Okonkwo", subject: "Rent Payment Due on April 1", sentAt: "2026-03-29T08:00:00", status: "opened", channel: "email" },
];
