"use client";

import { useState, useEffect } from "react";
import { Search, Filter, CheckCircle2, Clock, AlertTriangle, User, Plus, X, Loader2 } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { formatDate, cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";

export default function AdminMaintenancePage() {
  const { tickets: maintenanceTickets, updateTicket } = useAppState();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string }>({ id: "", name: "", role: "" });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser({ id: stored.id || "", name: stored.name || "", role: stored.role || "" });
    } catch {}
  }, []);

  // Create ticket form state
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("General");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [ticketLocation, setTicketLocation] = useState("");
  const [createError, setCreateError] = useState("");

  async function handleCreateTicket() {
    if (!ticketTitle.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ticketTitle.trim(),
          description: ticketDescription.trim(),
          category: ticketCategory,
          priority: ticketPriority,
          location: ticketLocation.trim() || undefined,
          createdById: currentUser.id,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setCreateError(data.error);
      } else {
        setShowCreate(false);
        setTicketTitle("");
        setTicketDescription("");
        setTicketCategory("General");
        setTicketPriority("medium");
        setTicketLocation("");
        window.location.reload();
      }
    } catch {
      setCreateError("Failed to create ticket");
    } finally {
      setCreating(false);
    }
  }

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
    inProgress: maintenanceTickets.filter((t) => t.status === "in_progress" || t.status === "in-progress").length,
    scheduled: maintenanceTickets.filter((t) => t.status === "scheduled").length,
    completed: maintenanceTickets.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Maintenance Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and assign maintenance requests across all units
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
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
                      {ticket.ticketNumber || ticket.id}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-slate-400">
                      {ticket.category}
                    </span>
                    {ticket.scheduledDate && (
                      <span className="text-xs text-purple-600">
                        Scheduled: {formatDate(ticket.scheduledDate)}
                      </span>
                    )}
                    {ticket.tenantName && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <User className="w-3 h-3" />
                        {ticket.tenantName}
                        {ticket.unit && ticket.unit !== "N/A" && ` · Unit ${ticket.unit}`}
                      </span>
                    )}
                    {ticket.location && (
                      <span className="text-xs text-slate-400">
                        Location: {ticket.location}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-slate-500">
                      Created by: <span className="font-medium text-slate-700">{ticket.createdByName || ticket.tenantName || "Unknown"}</span>
                    </span>
                    <span className="text-xs text-slate-500">
                      At: <span className="font-medium text-slate-700">{formatDate(ticket.createdAt)}</span>
                    </span>
                  </div>
                  {ticket.statusChangedAt && (
                    <div className="mt-1.5">
                      <span className="text-xs text-slate-500">
                        Marked <span className="font-medium text-slate-700">{ticket.status.replace(/[-_]/g, " ")}</span> by{" "}
                        <span className="font-medium text-slate-700">{ticket.statusChangedByName || "Unknown"}</span>
                        {" · "}
                        <span className="text-slate-400">{new Date(ticket.statusChangedAt).toLocaleString()}</span>
                      </span>
                    </div>
                  )}
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

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Create Maintenance Ticket</h2>
              <button onClick={() => { setShowCreate(false); setCreateError(""); }} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{createError}</div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">Created by:</span>
                <span className="text-sm font-medium text-slate-900">{currentUser.name || "Loading..."}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g. Leaking faucet in kitchen"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Appliance">Appliance</option>
                    <option value="Structural">Structural</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Landscaping">Landscaping</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (optional)</label>
                <input
                  type="text"
                  value={ticketLocation}
                  onChange={(e) => setTicketLocation(e.target.value)}
                  placeholder="e.g. Kitchen, Bathroom, Bedroom"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200">
              <button
                onClick={() => { setShowCreate(false); setCreateError(""); }}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!ticketTitle.trim() || creating}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
