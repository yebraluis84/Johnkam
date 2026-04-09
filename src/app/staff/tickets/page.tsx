"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Loader2,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  scheduledDate: string;
  entryPermission: string;
  tenantName: string;
  unit: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  scheduled: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-slate-100 text-slate-600",
};

export default function StaffTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(ticketId: string, newStatus: string) {
    setUpdatingId(ticketId);
    try {
      const res = await fetch("/api/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });
      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId ? { ...t, status: newStatus } : t
          )
        );
      }
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter || ticket.status.replace("-", "_") === statusFilter;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress" || t.status === "in_progress").length,
    scheduled: tickets.filter((t) => t.status === "scheduled").length,
    completed: tickets.filter((t) => t.status === "completed").length,
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance Tickets</h1>
        <p className="text-slate-500 mt-1">View and update maintenance requests</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", count: counts.total, color: "text-slate-700 bg-slate-100" },
          { label: "Open", count: counts.open, color: "text-yellow-700 bg-yellow-50" },
          { label: "In Progress", count: counts.inProgress, color: "text-blue-700 bg-blue-50" },
          { label: "Scheduled", count: counts.scheduled, color: "text-purple-700 bg-purple-50" },
          { label: "Completed", count: counts.completed, color: "text-green-700 bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-lg p-3 text-center", stat.color)}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tickets */}
      <div className="space-y-3">
        {filtered.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {ticket.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : ticket.priority === "high" || ticket.priority === "urgent" ? (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900">{ticket.title}</h3>
                    <span className="text-xs text-slate-400 font-mono">{ticket.ticketNumber}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{ticket.description}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-slate-400">{ticket.category}</span>
                    {ticket.location && (
                      <span className="text-xs text-slate-400">Location: {ticket.location}</span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {ticket.scheduledDate && (
                      <span className="text-xs text-purple-600">
                        Scheduled: {new Date(ticket.scheduledDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      {ticket.tenantName} &middot; Unit {ticket.unit}
                    </span>
                    {ticket.entryPermission && (
                      <span className="text-xs text-slate-400">
                        Entry: {ticket.entryPermission}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 sm:flex-col sm:items-end">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusColors[ticket.status] || "bg-slate-100 text-slate-600")}>
                  {ticket.status.replace(/[-_]/g, " ")}
                </span>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize", priorityColors[ticket.priority] || "bg-slate-100 text-slate-600")}>
                  {ticket.priority}
                </span>
                {ticket.status !== "completed" && ticket.status !== "closed" && (
                  <select
                    className="mt-1 text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 focus:ring-1 focus:ring-orange-500 outline-none"
                    defaultValue=""
                    disabled={updatingId === ticket.id}
                    onChange={(e) => {
                      if (e.target.value) updateStatus(ticket.id, e.target.value);
                    }}
                  >
                    <option value="">Update Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No tickets found</p>
        </div>
      )}
    </div>
  );
}
