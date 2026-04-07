"use client";

import {
  Building,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useAppState } from "@/lib/app-context";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminDashboardPage() {
  const { tenants: tenantAccounts, tickets: maintenanceTickets, vacancies, property: propertyInfo } = useAppState();
  const activeTenants = tenantAccounts.filter((t) => t.status === "active").length;
  const pendingTenants = tenantAccounts.filter((t) => t.status === "pending").length;
  const openTickets = maintenanceTickets.filter(
    (t) => t.status !== "completed" && t.status !== "closed"
  ).length;
  const availableUnits = vacancies.filter((v) => v.status === "available").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          {propertyInfo.name} — {propertyInfo.address}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Units</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {propertyInfo.occupiedUnits}/{propertyInfo.totalUnits}
              </p>
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {propertyInfo.vacantUnits} vacant units
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Tenants</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {activeTenants}
              </p>
            </div>
            <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {pendingTenants} pending
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Available Units</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {availableUnits}
              </p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Ready for move-in</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open Tickets</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {openTickets}
              </p>
            </div>
            <div className="w-11 h-11 bg-orange-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {maintenanceTickets.filter((t) => t.priority === "high" || t.priority === "urgent").length} high priority
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Tenants</h2>
            <Link
              href="/admin/tenants"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {tenantAccounts.slice(0, 5).map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                    {tenant.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {tenant.name}
                    </p>
                    <p className="text-xs text-slate-400">Unit {tenant.unit}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    tenant.status === "active"
                      ? "bg-green-100 text-green-700"
                      : tenant.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {tenant.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Tickets */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Maintenance Tickets</h2>
            <Link
              href="/admin/maintenance"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {maintenanceTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {ticket.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : ticket.priority === "high" || ticket.priority === "urgent" ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {ticket.id} &middot; {ticket.category}
                    </p>
                  </div>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
