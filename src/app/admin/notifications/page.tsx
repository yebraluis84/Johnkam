"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Send,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationLog {
  id: string;
  templateName: string;
  recipient: string;
  email: string;
  subject: string;
  status: string;
  channel: string;
  createdAt: string;
}

interface TenantOption {
  id: string;
  name: string;
  email: string;
  unit: string;
  userId: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "compose">("logs");
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Compose state
  const [recipient, setRecipient] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [logsRes, tenantsRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/tenants"),
      ]);
      const logsData = await logsRes.json();
      const tenantsData = await tenantsRes.json();
      setLogs(Array.isArray(logsData) ? logsData : []);
      setTenants(Array.isArray(tenantsData) ? tenantsData : []);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const recipients = recipient === "all" ? "all" : [recipient];
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim(), recipients }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ success: true, message: `Sent to ${data.sent} recipient(s)` });
        setSubject("");
        setMessage("");
        setRecipient("all");
        loadData();
      } else {
        setSendResult({ success: false, message: data.error || "Failed to send" });
      }
    } catch {
      setSendResult({ success: false, message: "Failed to send notification" });
    } finally {
      setSending(false);
    }
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusIcons: Record<string, React.ReactNode> = {
    delivered: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    bounced: <AlertTriangle className="w-4 h-4 text-red-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    failed: <AlertTriangle className="w-4 h-4 text-red-500" />,
  };

  const statusColors: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    bounced: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleString("en-US", {
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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Email Notifications</h1>
            <p className="text-slate-500 mt-0.5">Send notifications and view delivery history</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("compose")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Sent</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {logs.filter((l) => l.status === "delivered").length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Delivered</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {logs.filter((l) => l.status === "bounced" || l.status === "failed").length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Failed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { key: "logs" as const, label: "Delivery Log" },
          { key: "compose" as const, label: "Compose" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition",
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Delivery Log Tab */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recipient, template, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No notifications sent yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Compose a notification to get started
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0">
                        {statusIcons[log.status] || statusIcons.pending}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-900">{log.recipient}</p>
                          <span className="text-xs text-slate-400">{log.email}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{log.subject}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {log.templateName} &middot; {formatTimestamp(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0",
                        statusColors[log.status] || statusColors.pending
                      )}
                    >
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === "compose" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-3xl">
          <h2 className="font-semibold text-slate-900">Compose Notification</h2>

          {sendResult && (
            <div
              className={cn(
                "p-3 rounded-lg border",
                sendResult.success
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              )}
            >
              <p className="text-sm">{sendResult.message}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipients</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="all">All Tenants ({tenants.length})</option>
              {tenants.map((t) => (
                <option key={t.userId} value={t.userId}>
                  {t.name} — Unit {t.unit} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Email subject line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              placeholder="Write your notification message here..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setActiveTab("logs");
                setSendResult(null);
              }}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!subject.trim() || !message.trim() || sending}
              className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Now
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
