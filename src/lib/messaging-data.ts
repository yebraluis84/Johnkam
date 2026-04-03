export interface Conversation {
  id: string;
  participants: string[];
  subject: string;
  lastMessage: string;
  lastMessageDate: string;
  unread: number;
  messages: Message[];
}

export interface Message {
  id: string;
  sender: string;
  senderRole: "tenant" | "manager" | "maintenance";
  content: string;
  timestamp: string;
  read: boolean;
}

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    participants: ["Sarah Johnson", "Property Management"],
    subject: "Lease Renewal Discussion",
    lastMessage: "We'd be happy to offer you a renewal at the same rate.",
    lastMessageDate: "2026-04-01",
    unread: 1,
    messages: [
      {
        id: "m1",
        sender: "Sarah Johnson",
        senderRole: "tenant",
        content: "Hi, my lease expires in July. I'd like to discuss renewal options. Is there any possibility of keeping the same rate?",
        timestamp: "2026-03-28T10:30:00",
        read: true,
      },
      {
        id: "m2",
        sender: "Property Management",
        senderRole: "manager",
        content: "Hi Sarah! Thanks for reaching out. We appreciate you as a tenant. Let me review the current market rates and get back to you with options.",
        timestamp: "2026-03-28T14:15:00",
        read: true,
      },
      {
        id: "m3",
        sender: "Property Management",
        senderRole: "manager",
        content: "We'd be happy to offer you a renewal at the same rate. I'll prepare the renewal documents and send them to your portal for review.",
        timestamp: "2026-04-01T09:00:00",
        read: false,
      },
    ],
  },
  {
    id: "conv-2",
    participants: ["Sarah Johnson", "Mike Torres"],
    subject: "Parking Spot Assignment",
    lastMessage: "You've been assigned spot #42 in the south lot.",
    lastMessageDate: "2026-03-25",
    unread: 0,
    messages: [
      {
        id: "m4",
        sender: "Sarah Johnson",
        senderRole: "tenant",
        content: "Hi Mike, is there an additional covered parking spot available? I'd like to add one to my lease.",
        timestamp: "2026-03-24T16:00:00",
        read: true,
      },
      {
        id: "m5",
        sender: "Mike Torres",
        senderRole: "manager",
        content: "You've been assigned spot #42 in the south lot. It's $75/month, added to your next billing cycle. The key card has been updated.",
        timestamp: "2026-03-25T11:30:00",
        read: true,
      },
    ],
  },
  {
    id: "conv-3",
    participants: ["Sarah Johnson", "Maintenance Team"],
    subject: "Follow-up: Kitchen Faucet Repair",
    lastMessage: "All done! Let us know if you notice any issues.",
    lastMessageDate: "2026-03-30",
    unread: 0,
    messages: [
      {
        id: "m6",
        sender: "Maintenance Team",
        senderRole: "maintenance",
        content: "Hi Sarah, just following up on the faucet repair scheduled for April 3rd. We'll need access between 9am-12pm. Will that work?",
        timestamp: "2026-03-30T08:00:00",
        read: true,
      },
      {
        id: "m7",
        sender: "Sarah Johnson",
        senderRole: "tenant",
        content: "That works! I'll leave the key with the front desk.",
        timestamp: "2026-03-30T09:15:00",
        read: true,
      },
      {
        id: "m8",
        sender: "Maintenance Team",
        senderRole: "maintenance",
        content: "All done! Let us know if you notice any issues.",
        timestamp: "2026-03-30T14:00:00",
        read: true,
      },
    ],
  },
];

// Admin view: all conversations across all tenants
export const adminConversations: Conversation[] = [
  ...conversations,
  {
    id: "conv-4",
    participants: ["Marcus Chen", "Property Management"],
    subject: "Noise Complaint",
    lastMessage: "We've spoken to the neighbor. Please let us know if it continues.",
    lastMessageDate: "2026-03-29",
    unread: 0,
    messages: [
      {
        id: "m9",
        sender: "Marcus Chen",
        senderRole: "tenant",
        content: "The unit above me (3A) has been playing loud music past midnight for the last 3 nights. Can you please address this?",
        timestamp: "2026-03-28T07:00:00",
        read: true,
      },
      {
        id: "m10",
        sender: "Property Management",
        senderRole: "manager",
        content: "We've spoken to the neighbor. Please let us know if it continues.",
        timestamp: "2026-03-29T10:00:00",
        read: true,
      },
    ],
  },
  {
    id: "conv-5",
    participants: ["Emily Rodriguez", "Property Management"],
    subject: "Late Payment Arrangement",
    lastMessage: "I can pay half now and the rest by April 15th.",
    lastMessageDate: "2026-04-02",
    unread: 1,
    messages: [
      {
        id: "m11",
        sender: "Property Management",
        senderRole: "manager",
        content: "Hi Emily, we noticed your account has an outstanding balance of $4,200. Please contact us to discuss payment arrangements.",
        timestamp: "2026-04-01T09:00:00",
        read: true,
      },
      {
        id: "m12",
        sender: "Emily Rodriguez",
        senderRole: "tenant",
        content: "I can pay half now and the rest by April 15th. Would that be acceptable?",
        timestamp: "2026-04-02T12:00:00",
        read: false,
      },
    ],
  },
];
