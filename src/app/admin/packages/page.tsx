"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tenant { id: string; name: string; unit: string; }
interface Pkg { id: string; carrier: string; trackingNo: string | null; tenantName: string; unit: string; description: string | null; status: string; createdAt: string; }

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ carrier: "", trackingNo: "", tenantId: "", description: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/packages").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/tenants").then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([pkgs, tens]) => { setPackages(pkgs); setTenants(tens.map((t: Tenant) => ({ id: t.id, name: t.name, unit: t.unit }))); }).finally(() => setLoading(false));
  }, []);

  async function handleLog() {
    const tenant = tenants.find(t => t.id === form.tenantId);
    if (!tenant || !form.carrier) return; setCreating(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch("/api/packages", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier: form.carrier, trackingNo: form.trackingNo, tenantId: tenant.id, tenantName: tenant.name, unit: tenant.unit, description: form.description, receivedBy: user.name }) });
      if (res.ok) { const d = await fetch("/api/packages").then(r => r.json()); setPackages(d); setShowLog(false); setForm({ carrier: "", trackingNo: "", tenantId: "", description: "" }); }
    } catch {} setCreating(false);
  }

  const filtered = packages.filter(p => !search || p.tenantName.toLowerCase().includes(search.toLowerCase()) || p.unit.includes(search) || p.carrier.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-amber-600" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Package Tracking</h1><p className="text-slate-500 mt-0.5">Log and track deliveries</p></div>
        </div>
        <button onClick={() => setShowLog(true)} className="px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition flex items-center gap-2"><Plus className="w-4 h-4" /> Log Package</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Awaiting Pickup</p><p className="text-2xl font-bold text-amber-600 mt-1">{packages.filter(p => p.status === "received").length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Picked Up</p><p className="text-2xl font-bold text-green-600 mt-1">{packages.filter(p => p.status === "picked_up").length}</p></div>
      </div>

      <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Tenant</th><th className="text-left px-5 py-3 font-medium text-slate-600">Unit</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Carrier</th><th className="text-left px-5 py-3 font-medium text-slate-600">Tracking</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="text-left px-5 py-3 font-medium text-slate-600">Date</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.map(p => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-900">{p.tenantName}</td><td className="px-5 py-3 text-slate-600">{p.unit}</td>
              <td className="px-5 py-3 text-slate-600">{p.carrier}</td><td className="px-5 py-3 text-slate-500 font-mono text-xs">{p.trackingNo || "—"}</td>
              <td className="px-5 py-3"><span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", p.status === "picked_up" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{p.status === "picked_up" ? "Picked Up" : "Waiting"}</span></td>
              <td className="px-5 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}{filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No packages</td></tr>}</tbody>
        </table></div>
      </div>

      {showLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Log Package</h3>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Tenant *</label>
              <select value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none">
                <option value="">Select tenant</option>{tenants.map(t => <option key={t.id} value={t.id}>{t.name} — Unit {t.unit}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Carrier *</label>
              <select value={form.carrier} onChange={e => setForm({...form, carrier: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none">
                <option value="">Select carrier</option><option value="USPS">USPS</option><option value="UPS">UPS</option><option value="FedEx">FedEx</option><option value="Amazon">Amazon</option><option value="DHL">DHL</option><option value="Other">Other</option>
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Tracking Number</label><input type="text" value={form.trackingNo} onChange={e => setForm({...form, trackingNo: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" placeholder="e.g. Large box, envelope..." /></div>
            <div className="flex gap-3">
              <button onClick={() => setShowLog(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleLog} disabled={creating || !form.tenantId || !form.carrier} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition disabled:opacity-50">{creating ? "Logging..." : "Log Package"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
