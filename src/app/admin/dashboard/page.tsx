"use client";

import { useState, useEffect } from "react";
import {
  Building,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Home,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useAppState } from "@/lib/app-context";
import { StatusBadge } from "@/components/StatusBadge";

interface LateFeeInfo {
  tenantName: string;
  unit: string;
  balance: number;
  daysLate: number;
  lateFee: number;
}

export default function AdminDashboardPage() {
  const { tenants: tenantAccounts, tickets: maintenanceTickets, vacancies, property: propertyInfo } = useAppState();
  const [lateFees, setLateFees] = useState<LateFeeInfo[]>([]);

  useEffect(() => {
    // Calculate late fees from tenant balances and property settings
    Promise.all([
      fetch("/api/tenants").then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/settings").then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([tenants, settings]) => {
      const graceDays = settings?.lateFeeGraceDays || 5;
      const feeAmount = settings?.lateFeeAmount || 50;
      const dueDay = settings?.paymentDueDay || 1;

      const now = new Date();
      const currentDay = now.getDate();
      const pastDue = currentDay > dueDay + graceDays;

      if (pastDue && Array.isArray(tenants)) {
        const overdue = tenants
          .filter((t: { balance: number; status: string }) => t.balance > 0 && t.status === "active")
          .map((t: { name: string; unit: string; balance: number }) => ({
            tenantName: t.name,
            unit: t.unit,
            balance: t.balance,
            daysLate: currentDay - dueDay,
            lateFee: feeAmount,
          }));
        setLateFees(overdue);
      }
    });
  }, []);
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

      {/* Late Fee Alert */}
      {lateFees.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-900">Late Fee Alerts</h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              {lateFees.length} tenant{lateFees.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {lateFees.slice(0, 5).map((lf, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-red-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{lf.tenantName}</p>
                  <p className="text-xs text-slate-500">Unit {lf.unit} &middot; {lf.daysLate} days late</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">${lf.balance.toFixed(2)}</p>
                  <p className="text-xs text-red-500">+${lf.lateFee} fee</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
