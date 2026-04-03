"use client";

import { useState } from "react";
import {
  Bell,
  Mail,
  Send,
  Search,
  CheckCircle2,
  Eye,
  AlertTriangle,
  Clock,
  Plus,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
} from "lucide-react";
import { notificationTemplates, notificationLogs } from "@/lib/extended-data";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "logs" | "compose">("templates");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = notificationLogs.filter(
    (log) =>
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusIcons: Record<string, React.ReactNode> = {
    delivered: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    opened: <Eye className="w-4 h-4 text-blue-500" />,
    bounced: <AlertTriangle className="w-4 h-4 text-red-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
  };

  const statusColors: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    opened: "bg-blue-100 text-blue-700",
    bounced: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  const typeIcons: Record<string, string> = {
    payment_reminder: "bg-green-50 text-green-600",
    late_notice: "bg-red-50 text-red-600",
    lease_renewal: "bg-purple-50 text-purple-600",
    maintenance: "bg-orange-50 text-orange-600",
    announcement: "bg-blue-50 text-blue-600",
    welcome: "bg-emerald-50 text-emerald-600",
  };

  function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Email Notifications
            </h1>
            <p className="text-slate-500 mt-0.5">
              Manage templates, send notifications, and view delivery history
            </p>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{notificationLogs.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Sent</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {notificationLogs.filter((l) => l.status === "opened").length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Opened</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {notificationLogs.filter((l) => l.status === "delivered").length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Delivered</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {notificationLogs.filter((l) => l.status === "bounced").length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Bounced</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { key: "templates" as const, label: "Templates" },
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

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-3">
          {notificationTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", typeIcons[template.type])}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {template.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Subject: {template.subject}
                  </p>
                  {template.lastSent && (
                    <p className="text-xs text-slate-400 mt-1">
                      Last sent: {new Date(template.lastSent + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} to {template.recipientCount} recipients
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  Edit
                </button>
                <button
                  className={cn(
                    "flex items-center gap-1",
                    template.enabled ? "text-emerald-500" : "text-slate-400"
                  )}
                >
                  {template.enabled ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Log Tab */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recipient, template, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0">{statusIcons[log.status]}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-900">
                          {log.recipient}
                        </p>
                        <span className="text-xs text-slate-400">
                          via {log.channel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {log.subject}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {log.templateName} &middot; {formatTimestamp(log.sentAt)}
                      </p>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0", statusColors[log.status])}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === "compose" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-3xl">
          <h2 className="font-semibold text-slate-900">
            Compose Notification
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipients</label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
              <option>All Tenants (21)</option>
              <option>Active Tenants (18)</option>
              <option>Delinquent Tenants (1)</option>
              <option>Sarah Johnson - Unit 4B</option>
              <option>Marcus Chen - Unit 2A</option>
              <option>Emily Rodriguez - Unit 6C</option>
              <option>James Okonkwo - Unit 1D</option>
              <option>Priya Patel - Unit 3A</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Template (optional)</label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
              <option value="">No template - custom message</option>
              {notificationTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Email subject line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea
              rows={8}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              placeholder="Write your notification message here..."
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">SMS</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">Push Notification</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
              Save as Draft
            </button>
            <button className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
