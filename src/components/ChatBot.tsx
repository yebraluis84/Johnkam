"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message { role: "user" | "bot"; text: string; }

const faqs: Record<string, string> = {
  "rent": "Rent is due on the 1st of each month. You can pay via ACH, credit card, or check through the Payments page.",
  "maintenance": "Submit maintenance requests through the Maintenance page. For emergencies (flooding, fire, gas leak), call 911 first, then contact management.",
  "parking": "Parking spots can be viewed and managed from the Parking page. Contact management to request a spot assignment.",
  "lease": "View your lease details on the Lease Renewal page. Renewal offers will appear there when available.",
  "amenities": "Book amenities like the gym, pool, or party room from the Amenities page. Check availability and reserve your time slot.",
  "packages": "Package deliveries are logged by the front desk. Check the Packages page to see if you have any waiting for pickup.",
  "contact": "You can message management directly through the Messages page, or email at the address listed in your lease.",
  "move": "For move-in/move-out procedures, contact management. They will provide a checklist and schedule a walkthrough inspection.",
  "insurance": "Renter's insurance is required. Upload your policy details through your Profile page to stay compliant.",
  "payment": "We accept ACH bank transfers, credit cards, and checks. Go to the Payments page to make a payment.",
  "late": "Late fees apply after the grace period (typically 5 days). Check your lease or Settings for specific amounts.",
  "guest": "Guests are welcome. For extended stays (over 7 days), please notify management. Guest parking may require a temporary pass.",
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, answer] of Object.entries(faqs)) {
    if (lower.includes(key)) return answer;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey"))
    return "Hello! I'm the TenantHub assistant. How can I help you today? You can ask me about rent, maintenance, amenities, parking, packages, lease, and more.";
  if (lower.includes("thank"))
    return "You're welcome! Let me know if there's anything else I can help with.";
  return "I'm not sure about that. Try asking about: rent, maintenance, amenities, parking, packages, lease, insurance, or payments. For other questions, please message management through the Messages page.";
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I'm the TenantHub assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bot", text: findAnswer(userMsg) }]);
    }, 500);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col" style={{ height: "28rem" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-blue-600 rounded-t-xl">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">TenantHub Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                )}>{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
            />
            <button onClick={handleSend} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
