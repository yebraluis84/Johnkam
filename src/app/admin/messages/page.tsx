"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  PenSquare,
  Search,
  User,
  Shield,
  Wrench as WrenchIcon,
} from "lucide-react";
import { adminConversations } from "@/lib/messaging-data";
import { cn } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [selectedConv, setSelectedConv] = useState(adminConversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  const filtered = adminConversations.filter(
    (c) =>
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participants.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const totalUnread = adminConversations.reduce((sum, c) => sum + c.unread, 0);

  const roleColors = {
    tenant: "bg-blue-500",
    manager: "bg-emerald-500",
    maintenance: "bg-orange-500",
  };

  function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Messages
            {totalUnread > 0 && (
              <span className="ml-2 text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">
                {totalUnread} new
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">
            All tenant conversations
          </p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <PenSquare className="w-4 h-4" />
          New Message
        </button>
      </div>

      {showCompose && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-slate-900">New Message to Tenant</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
              <option>Sarah Johnson - Unit 4B</option>
              <option>Marcus Chen - Unit 2A</option>
              <option>Emily Rodriguez - Unit 6C</option>
              <option>James Okonkwo - Unit 1D</option>
              <option>Priya Patel - Unit 3A</option>
              <option>David Kim - Unit 5B</option>
              <option>All Tenants</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
            <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Message subject" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea rows={4} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none" placeholder="Type your message..." />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row" style={{ height: "calc(100vh - 240px)" }}>
        {/* Conversation List */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => {
              const tenantName = conv.participants.find((p) => p !== "Property Management" && p !== "Mike Torres" && p !== "Maintenance Team") || conv.participants[0];
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={cn(
                    "w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition",
                    selectedConv.id === conv.id && "bg-emerald-50 border-l-2 border-l-emerald-500"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{tenantName}</p>
                      <p className="text-xs font-medium text-slate-600 mt-0.5 truncate">{conv.subject}</p>
                      <p className="text-xs text-slate-400 mt-1 truncate">{conv.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-xs text-slate-400">
                        {new Date(conv.lastMessageDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      {conv.unread > 0 && (
                        <span className="mt-1 w-5 h-5 bg-emerald-500 text-white rounded-full text-xs flex items-center justify-center">{conv.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">{selectedConv.subject}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{selectedConv.participants.join(", ")}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedConv.messages.map((msg) => {
              const isAdmin = msg.senderRole === "manager" || msg.senderRole === "maintenance";
              return (
                <div key={msg.id} className={cn("flex gap-3", isAdmin && "flex-row-reverse")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white", roleColors[msg.senderRole])}>
                    {msg.senderRole === "tenant" ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  </div>
                  <div className={cn("max-w-[70%]", isAdmin && "text-right")}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isAdmin && <span className="text-xs font-medium text-slate-700">{msg.sender}</span>}
                      <span className="text-xs text-slate-400">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className={cn("inline-block px-4 py-2.5 rounded-2xl text-sm", isAdmin ? "bg-emerald-600 text-white rounded-tr-md" : "bg-slate-100 text-slate-700 rounded-tl-md")}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-3">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Type a reply..." />
              <button disabled={!newMessage.trim()} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
