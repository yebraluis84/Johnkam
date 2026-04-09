"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tenant {
  id: string;
  name: string;
  unit: string;
  leaseEnd: string;
  rentAmount: number;
}

interface Renewal {
  id: string;
  tenantId: string;
  tenantName: string;
  unit: string;
  currentLeaseEnd: string;
  newLeaseStart: string;
  newLeaseEnd: string;
  currentRent: number;
  proposedRent: number;
  status: string;
  offeredDate: string | null;
  respondedDate: string | null;
}

export default function AdminLeaseRenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ tenantId: "", newLeaseStart: "", newLeaseEnd: "", proposedRent: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/lease-renewals").then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/tenants").then((r) => r.ok ? r.json() : []).catch(() => []),
    ]).then(([ren, ten]) => {
      setRenewals(Array.isArray(ren) ? ren : []);
      setTenants(Array.isArray(ten) ? ten.map((t: { id: string; name: string; unit: string; leaseEnd: string; rentAmount: number }) => ({
        id: t.id, name: t.name, unit: t.unit, leaseEnd: t.leaseEnd, rentAmount: t.rentAmount,
      })) : []);
    }).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.tenantId || !form.newLeaseStart || !form.newLeaseEnd || !form.proposedRent) return;
    setCreating(true);
    try {
      const res = await fetch("/api/lease-renewals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: form.tenantId,
          newLeaseStart: form.newLeaseStart,
          newLeaseEnd: form.newLeaseEnd,
          proposedRent: parseFloat(form.proposedRent),
        }),
      });
      if (res.ok) {
        // Refresh
        const data = await fetch("/api/lease-renewals").then((r) => r.json());
        setRenewals(data);
        setShowCreate(false);
        setForm({ tenantId: "", newLeaseStart: "", newLeaseEnd: "", proposedRent: "" });
      }
    } catch {}
    setCreating(false);
  }

  const statusIcon = (s: string) => {
    if (s === "accepted") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (s === "declined") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  const statusColor = (s: string) => {
    if (s === "accepted") return "bg-green-100 text-green-700";
    if (s === "declined") return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lease Renewals</h1>
            <p className="text-slate-500 mt-0.5">Manage tenant lease renewal offers</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Offers", value: renewals.length, color: "text-slate-900" },
          { label: "Pending", value: renewals.filter((r) => r.status === "offered").length, color: "text-blue-600" },
          { label: "Accepted", value: renewals.filter((r) => r.status === "accepted").length, color: "text-green-600" },
          { label: "Declined", value: renewals.filter((r) => r.status === "declined").length, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Tenant</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Unit</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Current End</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">New Period</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Rent</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Offered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renewals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{r.tenantName}</td>
                  <td className="px-5 py-3 text-slate-600">{r.unit}</td>
                  <td className="px-5 py-3 text-slate-600">{r.currentLeaseEnd}</td>
                  <td className="px-5 py-3 text-slate-600">{r.newLeaseStart} — {r.newLeaseEnd}</td>
                  <td className="px-5 py-3 text-slate-600">
                    ${r.currentRent} → ${r.proposedRent}
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", statusColor(r.status))}>
                      {statusIcon(r.status)}
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{r.offeredDate || "—"}</td>
                </tr>
              ))}
              {renewals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No renewal offers yet. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Create Renewal Offer
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tenant</label>
              <select
                value={form.tenantId}
                onChange={(e) => {
                  const t = tenants.find((t) => t.id === e.target.value);
                  setForm({
                    ...form,
                    tenantId: e.target.value,
                    proposedRent: t ? String(t.rentAmount) : form.proposedRent,
                  });
                }}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
              >
                <option value="">Select tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — Unit {t.unit} (Lease ends {t.leaseEnd})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Start Date</label>
                <input
                  type="date"
                  value={form.newLeaseStart}
                  onChange={(e) => setForm({ ...form, newLeaseStart: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New End Date</label>
                <input
                  type="date"
                  value={form.newLeaseEnd}
                  onChange={(e) => setForm({ ...form, newLeaseEnd: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Proposed Monthly Rent ($)</label>
              <input
                type="number"
                value={form.proposedRent}
                onChange={(e) => setForm({ ...form, proposedRent: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.tenantId}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creating ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
