"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Mail, Phone, Trash2 } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function TenantsPage() {
  const { tenants: tenantAccounts, removeTenant } = useAppState();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  const filtered = tenantAccounts.filter((tenant) => {
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.unit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    inactive: "bg-gray-100 text-gray-700",
    delinquent: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenant Management</h1>
          <p className="text-slate-500 mt-1">
            {tenantAccounts.length} total tenants &middot;{" "}
            {tenantAccounts.filter((t) => t.status === "active").length} active
          </p>
        </div>
        <Link
          href="/admin/tenants/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Tenant
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or unit..."
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="delinquent">Delinquent</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active", count: tenantAccounts.filter((t) => t.status === "active").length, color: "text-green-600 bg-green-50" },
          { label: "Pending", count: tenantAccounts.filter((t) => t.status === "pending").length, color: "text-yellow-600 bg-yellow-50" },
          { label: "Delinquent", count: tenantAccounts.filter((t) => t.status === "delinquent").length, color: "text-red-600 bg-red-50" },
          { label: "Inactive", count: tenantAccounts.filter((t) => t.status === "inactive").length, color: "text-gray-600 bg-gray-50" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-lg p-3 text-center", stat.color)}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tenant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tenant) => (
          <div
            key={tenant.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm hover:border-slate-300 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  {tenant.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {tenant.name}
                  </p>
                  <p className="text-xs text-slate-500">Unit {tenant.unit}</p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                  statusColors[tenant.status]
                )}
              >
                {tenant.status}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                {tenant.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="w-3.5 h-3.5" />
                {tenant.phone}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Rent</p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(tenant.rentAmount)}/mo
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Balance</p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    tenant.balance > 0 ? "text-red-600" : "text-green-600"
                  )}
                >
                  {tenant.balance > 0
                    ? formatCurrency(tenant.balance)
                    : "Paid"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Lease: {formatDate(tenant.leaseStart)} — {formatDate(tenant.leaseEnd)}
              </span>
              <button
                onClick={() => {
                  if (confirm(`Remove ${tenant.name}? This will delete their account, tickets, and payment history.`)) {
                    setRemoving(tenant.id);
                    removeTenant(tenant.id).finally(() => setRemoving(null));
                  }
                }}
                disabled={removing === tenant.id}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Remove tenant"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">No tenants found</p>
        </div>
      )}
    </div>
  );
}
