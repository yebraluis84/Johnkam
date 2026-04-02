import { MaintenanceTicket, Payment, Announcement } from "./mock-data";

export interface TenantAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  balance: number;
  status: "active" | "pending" | "inactive" | "delinquent";
  moveInDate: string;
  avatar?: string;
}

export const tenantAccounts: TenantAccount[] = [
  {
    id: "t-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    unit: "4B",
    leaseStart: "2025-08-01",
    leaseEnd: "2026-07-31",
    rentAmount: 1850.0,
    balance: 1850.0,
    status: "active",
    moveInDate: "2025-08-01",
  },
  {
    id: "t-002",
    name: "Marcus Chen",
    email: "marcus.chen@email.com",
    phone: "(555) 234-5678",
    unit: "2A",
    leaseStart: "2025-06-01",
    leaseEnd: "2026-05-31",
    rentAmount: 1650.0,
    balance: 0,
    status: "active",
    moveInDate: "2025-06-01",
  },
  {
    id: "t-003",
    name: "Emily Rodriguez",
    email: "emily.rod@email.com",
    phone: "(555) 345-6789",
    unit: "6C",
    leaseStart: "2025-09-01",
    leaseEnd: "2026-08-31",
    rentAmount: 2100.0,
    balance: 4200.0,
    status: "delinquent",
    moveInDate: "2025-09-01",
  },
  {
    id: "t-004",
    name: "James Okonkwo",
    email: "james.ok@email.com",
    phone: "(555) 456-7890",
    unit: "1D",
    leaseStart: "2026-01-01",
    leaseEnd: "2026-12-31",
    rentAmount: 1450.0,
    balance: 1450.0,
    status: "active",
    moveInDate: "2026-01-01",
  },
  {
    id: "t-005",
    name: "Priya Patel",
    email: "priya.p@email.com",
    phone: "(555) 567-8901",
    unit: "3A",
    leaseStart: "2025-03-01",
    leaseEnd: "2026-02-28",
    rentAmount: 1750.0,
    balance: 0,
    status: "active",
    moveInDate: "2025-03-01",
  },
  {
    id: "t-006",
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "(555) 678-9012",
    unit: "5B",
    leaseStart: "2026-05-01",
    leaseEnd: "2027-04-30",
    rentAmount: 1950.0,
    balance: 0,
    status: "pending",
    moveInDate: "2026-05-01",
  },
  {
    id: "t-007",
    name: "Lisa Thompson",
    email: "lisa.t@email.com",
    phone: "(555) 789-0123",
    unit: "2C",
    leaseStart: "2024-11-01",
    leaseEnd: "2025-10-31",
    rentAmount: 1550.0,
    balance: 0,
    status: "inactive",
    moveInDate: "2024-11-01",
  },
];

export const adminCredentials = {
  email: "admin@maplheights.com",
  password: "admin2026",
  name: "Mike Torres",
  role: "Property Manager",
};

export const propertyInfo = {
  name: "Maple Heights",
  address: "1200 Maple Avenue, Suite 100",
  city: "Springfield, IL 62701",
  totalUnits: 24,
  occupiedUnits: 21,
  vacantUnits: 3,
  totalMonthlyRevenue: 42350.0,
  collectedThisMonth: 34850.0,
  pendingPayments: 7500.0,
};
