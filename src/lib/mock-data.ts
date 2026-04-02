// Mock data simulating a backend for the tenant portal

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  balance: number;
  avatar?: string;
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "scheduled" | "completed" | "closed";
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  images?: string[];
  comments: TicketComment[];
}

export interface TicketComment {
  id: string;
  author: string;
  role: "tenant" | "manager" | "maintenance";
  message: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: "credit_card" | "ach" | "check";
  status: "completed" | "pending" | "failed";
  description: string;
  confirmationNumber?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: "normal" | "important" | "urgent";
  author: string;
}

export interface LeaseDocument {
  id: string;
  name: string;
  type: "lease" | "addendum" | "notice" | "receipt" | "policy";
  date: string;
  size: string;
}

export const currentTenant: Tenant = {
  id: "t-001",
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "(555) 123-4567",
  unit: "Unit 4B - Maple Heights",
  leaseStart: "2025-08-01",
  leaseEnd: "2026-07-31",
  rentAmount: 1850.0,
  balance: 1850.0,
};

export const maintenanceTickets: MaintenanceTicket[] = [
  {
    id: "MT-1024",
    title: "Kitchen faucet leaking",
    description:
      "The kitchen faucet has been dripping constantly for the past 2 days. Water is pooling under the sink.",
    category: "Plumbing",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-03-28",
    updatedAt: "2026-03-30",
    scheduledDate: "2026-04-03",
    comments: [
      {
        id: "c1",
        author: "Sarah Johnson",
        role: "tenant",
        message:
          "The leak seems to be getting worse. Please prioritize this.",
        createdAt: "2026-03-29",
      },
      {
        id: "c2",
        author: "Mike Torres",
        role: "maintenance",
        message:
          "Scheduled for April 3rd. We'll replace the cartridge and check the supply lines.",
        createdAt: "2026-03-30",
      },
    ],
  },
  {
    id: "MT-1019",
    title: "AC not cooling properly",
    description:
      "The air conditioning unit is running but not cooling the apartment. Temperature stays around 78F even when set to 68F.",
    category: "HVAC",
    priority: "medium",
    status: "scheduled",
    createdAt: "2026-03-20",
    updatedAt: "2026-03-25",
    scheduledDate: "2026-04-05",
    comments: [
      {
        id: "c3",
        author: "Property Management",
        role: "manager",
        message: "HVAC technician has been scheduled for April 5th between 9am-12pm.",
        createdAt: "2026-03-25",
      },
    ],
  },
  {
    id: "MT-1010",
    title: "Bedroom window won't lock",
    description: "The lock mechanism on the bedroom window is broken and won't secure properly.",
    category: "Security",
    priority: "high",
    status: "completed",
    createdAt: "2026-03-10",
    updatedAt: "2026-03-15",
    comments: [
      {
        id: "c4",
        author: "Mike Torres",
        role: "maintenance",
        message: "Window lock has been replaced and tested. All secure now.",
        createdAt: "2026-03-15",
      },
    ],
  },
  {
    id: "MT-0998",
    title: "Light fixture flickering in bathroom",
    description: "The overhead light in the bathroom flickers intermittently.",
    category: "Electrical",
    priority: "low",
    status: "open",
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
    comments: [],
  },
];

export const payments: Payment[] = [
  {
    id: "PAY-3001",
    amount: 1850.0,
    date: "2026-03-01",
    method: "ach",
    status: "completed",
    description: "March 2026 Rent",
    confirmationNumber: "ACH-78234",
  },
  {
    id: "PAY-2890",
    amount: 1850.0,
    date: "2026-02-01",
    method: "credit_card",
    status: "completed",
    description: "February 2026 Rent",
    confirmationNumber: "CC-45123",
  },
  {
    id: "PAY-2770",
    amount: 1850.0,
    date: "2026-01-03",
    method: "ach",
    status: "completed",
    description: "January 2026 Rent",
    confirmationNumber: "ACH-67891",
  },
  {
    id: "PAY-2650",
    amount: 1850.0,
    date: "2025-12-01",
    method: "credit_card",
    status: "completed",
    description: "December 2025 Rent",
    confirmationNumber: "CC-33456",
  },
  {
    id: "PAY-2530",
    amount: 150.0,
    date: "2025-11-15",
    method: "credit_card",
    status: "completed",
    description: "Pet Deposit",
    confirmationNumber: "CC-22789",
  },
];

export const announcements: Announcement[] = [
  {
    id: "ann-1",
    title: "Water Shut-Off Notice - April 5th",
    message:
      "Please be advised that water service will be temporarily interrupted on April 5th from 9:00 AM to 2:00 PM for scheduled pipe maintenance in Building B. We recommend storing water beforehand for essential needs.",
    date: "2026-04-01",
    priority: "urgent",
    author: "Property Management",
  },
  {
    id: "ann-2",
    title: "Community BBQ - April 12th",
    message:
      "Join us for our Spring Community BBQ on April 12th from 12:00 PM to 4:00 PM at the courtyard! Food, drinks, and music provided. RSVP at the front desk by April 10th.",
    date: "2026-03-28",
    priority: "normal",
    author: "Community Events Team",
  },
  {
    id: "ann-3",
    title: "New Recycling Guidelines",
    message:
      "Starting April 1st, the city has updated recycling guidelines. Please review the new sorting requirements posted in the mail room. Key change: all plastics #1-#7 are now accepted.",
    date: "2026-03-25",
    priority: "important",
    author: "Property Management",
  },
  {
    id: "ann-4",
    title: "Parking Lot Resurfacing - April 15-17",
    message:
      "The south parking lot will be resurfaced April 15-17. Affected residents will receive alternate parking assignments via email by April 10th.",
    date: "2026-03-20",
    priority: "important",
    author: "Property Management",
  },
];

export const documents: LeaseDocument[] = [
  {
    id: "doc-1",
    name: "Lease Agreement - Unit 4B",
    type: "lease",
    date: "2025-08-01",
    size: "2.4 MB",
  },
  {
    id: "doc-2",
    name: "Pet Addendum",
    type: "addendum",
    date: "2025-08-01",
    size: "540 KB",
  },
  {
    id: "doc-3",
    name: "Move-In Inspection Report",
    type: "notice",
    date: "2025-08-01",
    size: "1.8 MB",
  },
  {
    id: "doc-4",
    name: "Community Rules & Policies",
    type: "policy",
    date: "2025-07-15",
    size: "890 KB",
  },
  {
    id: "doc-5",
    name: "Parking Policy",
    type: "policy",
    date: "2025-07-15",
    size: "320 KB",
  },
  {
    id: "doc-6",
    name: "Rent Payment Receipt - March 2026",
    type: "receipt",
    date: "2026-03-01",
    size: "125 KB",
  },
];
