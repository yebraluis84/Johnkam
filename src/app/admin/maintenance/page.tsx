"use client";

import { useState } from "react";
import { Search, Filter, CheckCircle2, Clock, AlertTriangle, User } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { formatDate, cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";

export default function AdminMaintenancePage() {
  const { tickets: maintenanceTickets, updateTicket } = useAppState();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = maintenanceTickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    total: maintenanceTickets.length,
    open: maintenanceTickets.filter((t) => t.status === "open").length,
    inProgress: maintenanceTickets.filter((t) => t.status === "in_progress").length,
    scheduled: maintenanceTickets.filter((t) => t.status === "scheduled").length,
    completed: maintenanceTickets.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Maintenance Management
        </h1>
        <p className="text-slate-500 mt-1">
          Manage and assign maintenance requests across all units
        </p>
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
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-white"
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
                    <h3 className="text-sm font-semibold text-slate-900">
                      {ticket.title}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {ticket.id}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-slate-400">
                      {ticket.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      Submitted: {formatDate(ticket.createdAt)}
                    </span>
                    {ticket.scheduledDate && (
                      <span className="text-xs text-purple-600">
                        Scheduled: {formatDate(ticket.scheduledDate)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      {ticket.tenantName ? `${ticket.tenantName}` : "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 sm:flex-col sm:items-end">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                {ticket.status !== "completed" && ticket.status !== "closed" && (
                  <select
                    className="mt-1 text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 focus:ring-1 focus:ring-emerald-500 outline-none"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        updateTicket(ticket.id, { status: e.target.value as "open" | "in_progress" | "scheduled" | "completed", updatedAt: new Date().toISOString().split("T")[0] });
                      }
                    }}
                  >
                    <option value="">Update Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
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
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">No tickets found</p>
        </div>
      )}
    </div>
  );
}
