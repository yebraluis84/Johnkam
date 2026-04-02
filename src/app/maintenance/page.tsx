"use client";

import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";
import { maintenanceTickets } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";

export default function MaintenancePage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = maintenanceTickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Maintenance Requests
          </h1>
          <p className="text-slate-500 mt-1">
            Track and manage your maintenance tickets
          </p>
        </div>
        <Link
          href="/maintenance/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase">
          <div className="col-span-1">ID</div>
          <div className="col-span-4">Issue</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Date</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/maintenance/${ticket.id}`}
              className="block hover:bg-slate-50 transition"
            >
              {/* Desktop row */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 items-center">
                <div className="col-span-1 text-sm text-slate-500 font-mono">
                  {ticket.id}
                </div>
                <div className="col-span-4">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {ticket.description}
                  </p>
                </div>
                <div className="col-span-2 text-sm text-slate-600">
                  {ticket.category}
                </div>
                <div className="col-span-1">
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div className="col-span-2">
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="col-span-2 text-sm text-slate-500">
                  {formatDate(ticket.createdAt)}
                </div>
              </div>

              {/* Mobile card */}
              <div className="md:hidden p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ticket.id} &middot; {ticket.category}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <span className="text-xs text-slate-400">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No maintenance requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
