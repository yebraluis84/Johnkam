"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Search,
  Loader2,
  Download,
  Plus,
  Minus,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  Users,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  description: string;
  method: string;
  status: string;
  confirmationNumber: string | null;
  tenantName: string;
  unit: string;
  tenantId: string;
  createdAt: string;
}

interface Tenant {
  id: string;
  name: string;
  unit: string;
  balance: number;
  rentAmount: number;
  autopayEnabled: boolean;
}

interface LateFeeInfo {
  paymentDueDay: number;
  lateFeeGraceDays: number;
  lateFeeAmount: number;
  currentDay: number;
  pastGracePeriod: boolean;
  eligible: { id: string; tenantName: string; unit: string; balance: number }[];
  alreadyCharged: {
    id: string;
    tenantName: string;
    unit: string;
    balance: number;
  }[];
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [showLateFees, setShowLateFees] = useState(false);
  const [lateFeeInfo, setLateFeeInfo] = useState<LateFeeInfo | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    tenantId: "",
    type: "charge",
    amount: "",
    description: "",
  });
  const [adjusting, setAdjusting] = useState(false);
  const [applyingFees, setApplyingFees] = useState(false);
  const [message, setMessage] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [pays, tenantData] = await Promise.all([
        fetch("/api/payments")
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
        fetch("/api/tenants")
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
      ]);
      setPayments(Array.isArray(pays) ? pays : []);
      setTenants(
        Array.isArray(tenantData)
          ? tenantData.map(
              (t: {
                id: string;
                name: string;
                unit: string;
                balance: number;
                rentAmount: number;
                autopayEnabled?: boolean;
              }) => ({
                id: t.id,
                name: t.name || "Unknown",
                unit: t.unit || "",
                balance: t.balance || 0,
                rentAmount: t.rentAmount || 0,
                autopayEnabled: t.autopayEnabled || false,
              })
            )
          : []
      );
    } catch {}
    setLoading(false);
  }

  async function loadLateFees() {
    try {
      const res = await fetch("/api/late-fees");
      if (res.ok) {
        const data = await res.json();
        setLateFeeInfo(data);
      }
    } catch {}
    setShowLateFees(true);
  }

  async function applyLateFees() {
    setApplyingFees(true);
    try {
      const res = await fetch("/api/late-fees", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setMessage(
          `Applied ${data.applied.length} late fee(s) of $${data.lateFeeAmount.toFixed(2)} each`
        );
        setShowLateFees(false);
        loadData();
      }
    } catch {}
    setApplyingFees(false);
  }

  async function handleAdjust() {
    if (!adjustForm.tenantId || !adjustForm.amount) return;
    setAdjusting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch("/api/payment-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...adjustForm,
          adminName: user.name || "Admin",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(
          `${adjustForm.type.charAt(0).toUpperCase() + adjustForm.type.slice(1)} of $${parseFloat(adjustForm.amount).toFixed(2)} applied — ${data.confirmation}`
        );
        setShowAdjust(false);
        setAdjustForm({
          tenantId: "",
          type: "charge",
          amount: "",
          description: "",
        });
        loadData();
      }
    } catch {}
    setAdjusting(false);
  }

  function exportCSV() {
    const header =
      "Date,Tenant,Unit,Description,Method,Amount,Status,Confirmation\n";
    const rows = filtered
      .map(
        (p) =>
          `${new Date(p.createdAt).toLocaleDateString()},"${p.tenantName}",${p.unit},"${p.description}",${p.method.toUpperCase()},${p.amount.toFixed(2)},${p.status},${p.confirmationNumber || ""}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const now = new Date();
  const filtered = payments
    .filter(
      (p) =>
        !search ||
        p.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        p.unit.includes(search) ||
        (p.confirmationNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (filterMonth === "all") return true;
      const d = new Date(p.createdAt);
      if (filterMonth === "this")
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      if (filterMonth === "last") {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
          d.getMonth() === lm.getMonth() &&
          d.getFullYear() === lm.getFullYear()
        );
      }
      return true;
    });

  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + p.amount, 0);
  const thisMonth = payments
    .filter(
      (p) =>
        new Date(p.createdAt).getMonth() === now.getMonth() &&
        new Date(p.createdAt).getFullYear() === now.getFullYear()
    )
    .reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = tenants.reduce((s, t) => s + Math.max(0, t.balance), 0);
  const collectionRate =
    tenants.length > 0
      ? Math.round(
          (tenants.filter((t) => t.balance <= 0).length / tenants.length) *
            100
        )
      : 0;

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
            <p className="text-slate-500 mt-0.5">
              Track payments, apply fees & manage adjustments
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadLateFees}
            className="px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" /> Late Fees
          </button>
          <button
            onClick={() => setShowAdjust(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adjustment
          </button>
        </div>
      </div>

      {/* Message banner */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{message}</p>
          </div>
          <button
            onClick={() => setMessage("")}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Analytics row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total Collected</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">This Month</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${thisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Outstanding</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Collection Rate</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-900">
              {collectionRate}%
            </p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">AutoPay Enrolled</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-blue-600">
              {tenants.filter((t) => t.autopayEnabled).length}
            </p>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Delinquent tenants */}
      {tenants.filter((t) => t.balance > 0).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Outstanding Balances
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tenants
              .filter((t) => t.balance > 0)
              .sort((a, b) => b.balance - a.balance)
              .map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-lg p-3 border border-red-100"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">Unit {t.unit}</p>
                  <p className="text-lg font-bold text-red-600 mt-1">
                    ${t.balance.toFixed(2)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant, unit, confirmation, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
          />
        </div>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
        >
          <option value="all">All Time</option>
          <option value="this">This Month</option>
          <option value="last">Last Month</option>
        </select>
        <button
          onClick={exportCSV}
          className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  Tenant
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  Unit
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  Description
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  Amount
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  Method
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  Confirmation
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {p.tenantName}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{p.unit}</td>
                  <td className="px-5 py-3 text-slate-600">
                    <span
                      className={cn(
                        p.description.includes("Late Fee") &&
                          "text-red-600 font-medium",
                        p.description.includes("Credit") &&
                          "text-green-600 font-medium",
                        p.description.includes("Refund") &&
                          "text-amber-600 font-medium"
                      )}
                    >
                      {p.description}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    ${p.amount.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {p.method.toUpperCase()}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        p.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">
                    {p.confirmationNumber || "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjust && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Payment Adjustment
              </h3>
              <button
                onClick={() => setShowAdjust(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  setAdjustForm({ ...adjustForm, type: "charge" })
                }
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition text-xs font-medium",
                  adjustForm.type === "charge"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <Plus className="w-5 h-5" />
                Charge
              </button>
              <button
                onClick={() =>
                  setAdjustForm({ ...adjustForm, type: "credit" })
                }
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition text-xs font-medium",
                  adjustForm.type === "credit"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <Minus className="w-5 h-5" />
                Credit
              </button>
              <button
                onClick={() =>
                  setAdjustForm({ ...adjustForm, type: "refund" })
                }
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition text-xs font-medium",
                  adjustForm.type === "refund"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <RotateCcw className="w-5 h-5" />
                Refund
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tenant
              </label>
              <select
                value={adjustForm.tenantId}
                onChange={(e) =>
                  setAdjustForm({
                    ...adjustForm,
                    tenantId: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
              >
                <option value="">Select tenant...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — Unit {t.unit} (Balance: ${t.balance.toFixed(2)}
                    )
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={adjustForm.amount}
                onChange={(e) =>
                  setAdjustForm({
                    ...adjustForm,
                    amount: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={adjustForm.description}
                onChange={(e) =>
                  setAdjustForm({
                    ...adjustForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                placeholder={
                  adjustForm.type === "charge"
                    ? "e.g., Damage repair, Utility charge"
                    : adjustForm.type === "credit"
                      ? "e.g., Move-in promotion, Overpayment"
                      : "e.g., Duplicate payment refund"
                }
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAdjust(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={
                  adjusting || !adjustForm.tenantId || !adjustForm.amount
                }
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2",
                  adjustForm.type === "charge"
                    ? "bg-red-600 hover:bg-red-700"
                    : adjustForm.type === "credit"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-amber-600 hover:bg-amber-700"
                )}
              >
                {adjusting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {adjusting
                  ? "Processing..."
                  : `Apply ${adjustForm.type.charAt(0).toUpperCase() + adjustForm.type.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Late Fees Modal */}
      {showLateFees && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> Late
                Fees
              </h3>
              <button
                onClick={() => setShowLateFees(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lateFeeInfo ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Due Day</p>
                    <p className="font-semibold text-slate-900">
                      {lateFeeInfo.paymentDueDay}
                      {lateFeeInfo.paymentDueDay === 1
                        ? "st"
                        : lateFeeInfo.paymentDueDay === 2
                          ? "nd"
                          : lateFeeInfo.paymentDueDay === 3
                            ? "rd"
                            : "th"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Grace Period</p>
                    <p className="font-semibold text-slate-900">
                      {lateFeeInfo.lateFeeGraceDays} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Fee Amount</p>
                    <p className="font-semibold text-red-600">
                      ${lateFeeInfo.lateFeeAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {!lateFeeInfo.pastGracePeriod && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    Grace period has not ended yet (day{" "}
                    {lateFeeInfo.currentDay} of month).
                  </div>
                )}

                {lateFeeInfo.eligible.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Eligible for late fee (
                      {lateFeeInfo.eligible.length} tenants):
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {lateFeeInfo.eligible.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between bg-red-50 rounded-lg p-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {t.tenantName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Unit {t.unit}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-red-600">
                            ${t.balance.toFixed(2)} owed
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No tenants eligible for late fees
                  </p>
                )}

                {lateFeeInfo.alreadyCharged.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-2">
                      Already charged this month (
                      {lateFeeInfo.alreadyCharged.length}):
                    </p>
                    <div className="space-y-1">
                      {lateFeeInfo.alreadyCharged.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between bg-slate-50 rounded-lg p-2 text-xs"
                        >
                          <span className="text-slate-600">
                            {t.tenantName} — Unit {t.unit}
                          </span>
                          <span className="text-slate-400">
                            Already charged
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLateFees(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyLateFees}
                    disabled={
                      applyingFees ||
                      lateFeeInfo.eligible.length === 0
                    }
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {applyingFees && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {applyingFees
                      ? "Applying..."
                      : `Apply Late Fees (${lateFeeInfo.eligible.length})`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
