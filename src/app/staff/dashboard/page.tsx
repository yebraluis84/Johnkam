"use client";

import { useState, useEffect } from "react";
import { Wrench, AlertTriangle, Clock, CheckCircle2, Loader2, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  tenantName: string;
  unit: string;
  createdAt: string;
}

export default function StaffDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [notifyOnNewTicket, setNotifyOnNewTicket] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefError, setPrefError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"open" | "in_progress" | "scheduled" | "completed">("open");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(stored.name || "");
    } catch {}

    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/user/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.notifyOnNewTicket === "boolean") {
          setNotifyOnNewTicket(data.notifyOnNewTicket);
        }
      })
      .catch(() => {});
  }, []);

  async function handleNotifyToggle(next: boolean) {
    const prev = notifyOnNewTicket;
    setNotifyOnNewTicket(next); // optimistic
    setPrefSaving(true);
    setPrefError("");
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyOnNewTicket: next }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch {
      setNotifyOnNewTicket(prev); // revert on error
      setPrefError("Couldn't save — try again");
    } finally {
      setPrefSaving(false);
    }
  }

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in-progress" || t.status === "in_progress").length;
  const scheduledCount = tickets.filter((t) => t.status === "scheduled").length;
  const completedCount = tickets.filter((t) => t.status === "completed").length;

  const filteredTickets = tickets.filter((t) => {
    if (selectedStatus === "in_progress") return t.status === "in-progress" || t.status === "in_progress";
    return t.status === selectedStatus;
  });

  const statusLabels: Record<typeof selectedStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    scheduled: "Scheduled",
    completed: "Completed",
  };

  const emptyMessages: Record<typeof selectedStatus, string> = {
    open: "All caught up! No open tickets.",
    in_progress: "Nothing in progress.",
    scheduled: "Nothing scheduled.",
    completed: "No completed tickets yet.",
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {userName || "Staff"}
          </h1>
          <p className="text-slate-500 mt-1">Maintenance dashboard overview</p>
        </div>

        {/* Notification preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:max-w-sm w-full">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Email me on new tickets
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Get notified when a tenant submits a request
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnNewTicket}
                  disabled={prefSaving}
                  onChange={(e) => handleNotifyToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 border-slate-300 focus:ring-orange-500 flex-shrink-0"
                />
              </label>
              {prefError && (
                <p className="text-xs text-red-600 mt-1">{prefError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats — clickable filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setSelectedStatus("open")}
          aria-pressed={selectedStatus === "open"}
          className={cn(
            "bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition text-left cursor-pointer",
            selectedStatus === "open"
              ? "border-yellow-400 ring-2 ring-yellow-300"
              : "border-slate-200/80 hover:border-yellow-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{openCount}</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("in_progress")}
          aria-pressed={selectedStatus === "in_progress"}
          className={cn(
            "bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition text-left cursor-pointer",
            selectedStatus === "in_progress"
              ? "border-blue-400 ring-2 ring-blue-300"
              : "border-slate-200/80 hover:border-blue-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("scheduled")}
          aria-pressed={selectedStatus === "scheduled"}
          className={cn(
            "bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition text-left cursor-pointer",
            selectedStatus === "scheduled"
              ? "border-purple-400 ring-2 ring-purple-300"
              : "border-slate-200/80 hover:border-purple-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Scheduled</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{scheduledCount}</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm flex items-center justify-center">
              <Wrench className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("completed")}
          aria-pressed={selectedStatus === "completed"}
          className={cn(
            "bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition text-left cursor-pointer",
            selectedStatus === "completed"
              ? "border-green-400 ring-2 ring-green-300"
              : "border-slate-200/80 hover:border-green-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </button>
      </div>

      {/* Tickets — filtered by selected status card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{statusLabels[selectedStatus]} Tickets</h2>
          <Link
            href="/staff/tickets"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {ticket.priority === "high" || ticket.priority === "urgent" ? (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Wrench className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {ticket.ticketNumber} &middot; {ticket.unit && ticket.unit !== "N/A" ? `Unit ${ticket.unit} · ` : ""}{ticket.category}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                  ticket.priority === "urgent"
                    ? "bg-red-100 text-red-700"
                    : ticket.priority === "high"
                    ? "bg-orange-100 text-orange-700"
                    : ticket.priority === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {ticket.priority}
              </span>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-300" />
              <p className="text-sm">{emptyMessages[selectedStatus]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
