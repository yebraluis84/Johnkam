"use client";

import { useState, useEffect } from "react";
import { DollarSign, Search, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment { id: string; amount: number; description: string; method: string; status: string; confirmationNumber: string | null; tenantName: string; unit: string; createdAt: string; }

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetch("/api/payments").then(r => r.ok ? r.json() : []).then(d => setPayments(Array.isArray(d) ? d : [])).catch(() => []).finally(() => setLoading(false)); }, []);

  const filtered = payments.filter(p => !search || p.tenantName.toLowerCase().includes(search.toLowerCase()) || p.unit.includes(search) || (p.confirmationNumber || "").includes(search));
  const totalCollected = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Payments</h1><p className="text-slate-500 mt-0.5">Track all rent payments</p></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Total Collected</p><p className="text-2xl font-bold text-green-600 mt-1">${totalCollected.toFixed(2)}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">This Month</p><p className="text-2xl font-bold text-slate-900 mt-1">${payments.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).reduce((s,p) => s + p.amount, 0).toFixed(2)}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Total Payments</p><p className="text-2xl font-bold text-slate-900 mt-1">{payments.length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-yellow-600 mt-1">{payments.filter(p => p.status === "pending").length}</p></div>
      </div>

      <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search by tenant, unit, confirmation..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Tenant</th><th className="text-left px-5 py-3 font-medium text-slate-600">Unit</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Amount</th><th className="text-left px-5 py-3 font-medium text-slate-600">Method</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="text-left px-5 py-3 font-medium text-slate-600">Confirmation</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Date</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.map(p => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-900">{p.tenantName}</td><td className="px-5 py-3 text-slate-600">{p.unit}</td>
              <td className="px-5 py-3 font-medium text-slate-900">${p.amount.toFixed(2)}</td><td className="px-5 py-3 text-slate-600">{p.method.toUpperCase()}</td>
              <td className="px-5 py-3"><span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", p.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>{p.status}</span></td>
              <td className="px-5 py-3 text-slate-500 font-mono text-xs">{p.confirmationNumber || "—"}</td>
              <td className="px-5 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}{filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No payments found</td></tr>}</tbody>
        </table></div>
      </div>
    </div>
  );
}
