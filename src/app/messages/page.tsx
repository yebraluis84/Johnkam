"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  PenSquare,
  Search,
  User,
  Shield,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  subject: string;
  participants: Participant[];
  messages: Message[];
  unread: number;
  lastMessage: string;
  lastMessageAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  role: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compose state
  const [composeRecipient, setComposeRecipient] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeSending, setComposeSending] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setUserId(stored.id || "");
      setUserName(stored.name || "");
      if (stored.id) loadConversations(stored.id);
    } catch {
      setLoading(false);
    }

    // Load admin users for compose
    fetch("/api/debug")
      .then((r) => r.json())
      .then((users) => {
        const adminUsers = users.filter((u: AdminUser) => u.role === "ADMIN" || u.role === "MAINTENANCE");
        setAdmins(adminUsers);
        if (adminUsers.length > 0) setComposeRecipient(adminUsers[0].id);
      })
      .catch(() => {});
  }, []);

  async function loadConversations(uid: string) {
    try {
      const res = await fetch(`/api/messages?userId=${uid}`);
      const data = await res.json();
      const convs = Array.isArray(data) ? data : [];
      setConversations(convs);
      if (convs.length > 0 && !selectedConv) {
        setSelectedConv(convs[0]);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  async function handleSend() {
    if (!newMessage.trim() || !selectedConv || !userId) return;
    setSendingMsg(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          conversationId: selectedConv.id,
          content: newMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.id) {
        setNewMessage("");
        // Add message to current conversation
        setSelectedConv((prev) =>
          prev
            ? { ...prev, messages: [...prev.messages, data], lastMessage: data.content }
            : prev
        );
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConv.id
              ? { ...c, messages: [...c.messages, data], lastMessage: data.content }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSendingMsg(false);
    }
  }

  async function handleCompose() {
    if (!composeRecipient || !composeSubject.trim() || !composeMessage.trim() || !userId) return;
    setComposeSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          recipientId: composeRecipient,
          subject: composeSubject.trim(),
          content: composeMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.id) {
        setShowCompose(false);
        setComposeSubject("");
        setComposeMessage("");
        loadConversations(userId);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    } finally {
      setComposeSending(false);
    }
  }

  function selectConversation(conv: Conversation) {
    setSelectedConv(conv);
    // Mark as read
    if (conv.unread > 0 && userId) {
      fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conv.id, userId }),
      }).then(() => {
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
        );
      });
    }
  }

  const filtered = conversations.filter(
    (c) =>
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 mt-1">Chat with property management</p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <PenSquare className="w-4 h-4" />
          New Message
        </button>
      </div>

      {/* Compose */}
      {showCompose && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-slate-900">New Message</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
            <select
              value={composeRecipient}
              onChange={(e) => setComposeRecipient(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role === "ADMIN" ? "Property Management" : "Maintenance"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="What's this about?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea
              rows={4}
              value={composeMessage}
              onChange={(e) => setComposeMessage(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Type your message..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCompose(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCompose}
              disabled={!composeSubject.trim() || !composeMessage.trim() || composeSending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {composeSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send
            </button>
          </div>
        </div>
      )}

      {conversations.length === 0 && !showCompose ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No messages yet</p>
          <p className="text-sm text-slate-400 mt-1">Start a conversation with property management</p>
          <button
            onClick={() => setShowCompose(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <PenSquare className="w-4 h-4" />
            New Message
          </button>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row"
          style={{ height: "calc(100vh - 240px)" }}
        >
          {/* Conversation List */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((conv) => {
                const otherParticipants = conv.participants
                  .filter((p) => p.id !== userId)
                  .map((p) => p.name)
                  .join(", ");
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={cn(
                      "w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition",
                      selectedConv?.id === conv.id && "bg-blue-50 border-l-2 border-l-blue-500"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {otherParticipants || "Conversation"}
                        </p>
                        <p className="text-xs font-medium text-slate-600 mt-0.5 truncate">
                          {conv.subject}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-xs text-slate-400">
                          {new Date(conv.lastMessageAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {conv.unread > 0 && (
                          <span className="mt-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">{selectedConv.subject}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedConv.participants
                      .filter((p) => p.id !== userId)
                      .map((p) => p.name)
                      .join(", ")}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConv.messages.map((msg) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <div key={msg.id} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                            isMe ? "bg-blue-500" : "bg-emerald-500"
                          )}
                        >
                          {isMe ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        </div>
                        <div className={cn("max-w-[70%]", isMe && "text-right")}>
                          <div className="flex items-center gap-2 mb-1">
                            {!isMe && (
                              <span className="text-xs font-medium text-slate-700">
                                {msg.senderName}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">{formatTime(msg.createdAt)}</span>
                          </div>
                          <div
                            className={cn(
                              "inline-block px-4 py-2.5 rounded-2xl text-sm",
                              isMe
                                ? "bg-blue-600 text-white rounded-tr-md"
                                : "bg-slate-100 text-slate-700 rounded-tl-md"
                            )}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Type a message..."
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sendingMsg}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
