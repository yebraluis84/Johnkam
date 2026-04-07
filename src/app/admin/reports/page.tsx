"use client";

import {
  BarChart3,
  Wrench,
  Clock,
  Users,
  Home,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { tenants, tickets, vacancies, property } = useAppState();

  const activeCount = tenants.filter((t) => t.status === "active").length;
  const pendingCount = tenants.filter((t) => t.status === "pending").length;
  const openTickets = tickets.filter((t) => t.status !== "completed" && t.status !== "closed").length;
  const completedTickets = tickets.filter((t) => t.status === "completed" || t.status === "closed").length;
  const availableUnits = vacancies.filter((v) => v.status === "available").length;
  const occupancyRate = property.totalUnits > 0
    ? Math.round((property.occupiedUnits / property.totalUnits) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-0.5">
            Property performance overview
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Occupancy Rate</p>
            <Home className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {occupancyRate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {property.occupiedUnits} of {property.totalUnits} units
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Tenants</p>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {tenants.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {activeCount} active, {pendingCount} pending
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Open Tickets</p>
            <Wrench className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {openTickets}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {completedTickets} completed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Available Units</p>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {availableUnits}
          </p>
          <p className="text-xs text-slate-400 mt-1">Ready for move-in</p>
        </div>
      </div>

      {/* Occupancy Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Occupancy Overview</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Occupied</span>
            <span className="font-medium text-slate-900">{property.occupiedUnits} units</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4">
            <div
              className="h-4 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>{occupancyRate}% occupied</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Tenant Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Tenant Status Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: "Active", count: activeCount, color: "bg-green-500" },
              { label: "Pending", count: pendingCount, color: "bg-yellow-500" },
              { label: "Inactive", count: tenants.filter((t) => t.status === "inactive").length, color: "bg-gray-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", item.color)} />
                <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Maintenance Overview</h2>
          <div className="space-y-3">
            {[
              { label: "Open", count: tickets.filter((t) => t.status === "open").length, color: "bg-yellow-500" },
              { label: "In Progress", count: tickets.filter((t) => t.status === "in_progress").length, color: "bg-blue-500" },
              { label: "Scheduled", count: tickets.filter((t) => t.status === "scheduled").length, color: "bg-purple-500" },
              { label: "Completed", count: completedTickets, color: "bg-green-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", item.color)} />
                <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unit Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Unit Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{availableUnits}</p>
            <p className="text-xs text-green-700 mt-1">Available</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{property.occupiedUnits}</p>
            <p className="text-xs text-blue-700 mt-1">Occupied</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {vacancies.filter((v) => v.status === "maintenance").length}
            </p>
            <p className="text-xs text-orange-700 mt-1">Under Maintenance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
