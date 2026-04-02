"use client";

import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Building,
  Search,
} from "lucide-react";
import { useState } from "react";
import { tenantAccounts, propertyInfo } from "@/lib/admin-data";
import { payments } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const allPayments = [
    ...payments.map((p) => ({ ...p, tenant: "Sarah Johnson", unit: "4B" })),
    {
      id: "PAY-3010",
      amount: 1650.0,
      date: "2026-03-01",
      method: "ach" as const,
      status: "completed" as const,
      description: "March 2026 Rent",
      confirmationNumber: "ACH-88210",
      tenant: "Marcus Chen",
      unit: "2A",
    },
    {
      id: "PAY-3015",
      amount: 1750.0,
      date: "2026-03-02",
      method: "credit_card" as const,
      status: "completed" as const,
      description: "March 2026 Rent",
      confirmationNumber: "CC-55321",
      tenant: "Priya Patel",
      unit: "3A",
    },
    {
      id: "PAY-3020",
      amount: 1450.0,
      date: "2026-03-01",
      method: "ach" as const,
      status: "completed" as const,
      description: "March 2026 Rent",
      confirmationNumber: "ACH-99102",
      tenant: "James Okonkwo",
      unit: "1D",
    },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = allPayments.filter(
    (p) =>
      p.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCollected = allPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const delinquentTenants = tenantAccounts.filter((t) => t.status === "delinquent");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Payments & Financials
        </h1>
        <p className="text-slate-500 mt-1">
          Track rent collection and payment history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Monthly Target</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(propertyInfo.totalMonthlyRevenue)}
              </p>
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Collected</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(propertyInfo.collectedThisMonth)}
              </p>
            </div>
            <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(propertyInfo.pendingPayments)}
              </p>
            </div>
            <div className="w-11 h-11 bg-yellow-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Collection Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {Math.round(
                  (propertyInfo.collectedThisMonth /
                    propertyInfo.totalMonthlyRevenue) *
                    100
                )}
                %
              </p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Delinquent Tenants */}
      {delinquentTenants.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-red-800">
              Delinquent Accounts ({delinquentTenants.length})
            </h2>
          </div>
          <div className="space-y-2">
            {delinquentTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between bg-white rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-700">
                    {tenant.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {tenant.name}
                    </p>
                    <p className="text-xs text-slate-500">Unit {tenant.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">
                    {formatCurrency(tenant.balance)}
                  </p>
                  <button className="text-xs text-red-600 hover:text-red-700 underline">
                    Send Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">All Payments</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-64"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {payment.method === "credit_card" ? (
                    <CreditCard className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Building className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {payment.tenant}
                    </p>
                    <span className="text-xs text-slate-400">
                      Unit {payment.unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {payment.description} &middot; {formatDate(payment.date)} &middot;{" "}
                    {payment.method === "credit_card" ? "Credit Card" : "ACH"}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(payment.amount)}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    payment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
