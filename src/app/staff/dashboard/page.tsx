"use client";

import { useState, useEffect } from "react";
import { Wrench, AlertTriangle, Clock, CheckCircle2, Loader2 } from "lucide-react";
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
  }, []);

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in-progress" || t.status === "in_progress").length;
  const scheduledCount = tickets.filter((t) => t.status === "scheduled").length;
  const completedCount = tickets.filter((t) => t.status === "completed").length;

  const activeTickets = tickets.filter(
    (t) => t.status !== "completed" && t.status !== "closed"
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {userName || "Staff"}
        </h1>
        <p className="text-slate-500 mt-1">Maintenance dashboard overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{openCount}</p>
            </div>
            <div className="w-11 h-11 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Scheduled</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{scheduledCount}</p>
            </div>
            <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
            </div>
            <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Tickets */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Active Tickets</h2>
          <Link
            href="/staff/tickets"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {activeTickets.slice(0, 8).map((ticket) => (
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
          {activeTickets.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-300" />
              <p className="text-sm">All caught up! No active tickets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
