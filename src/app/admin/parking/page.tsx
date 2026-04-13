"use client";

import { useState, useEffect } from "react";
import { Car, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Spot { id: string; spotNumber: string; type: string; level: string | null; tenantId: string | null; tenantName: string | null; unit: string | null; monthlyFee: number; status: string; }
interface Tenant { id: string; name: string; unit: string; }

export default function AdminParkingPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState<Spot | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ spotNumber: "", type: "standard", level: "", monthlyFee: "0" });
  const [assignTenantId, setAssignTenantId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/parking").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/tenants").then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([sp, ten]) => { setSpots(sp); setTenants(ten.map((t: Tenant) => ({ id: t.id, name: t.name, unit: t.unit }))); }).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.spotNumber) return; setCreating(true);
    try {
      const res = await fetch("/api/parking", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, monthlyFee: parseFloat(form.monthlyFee) || 0 }) });
      if (res.ok) { const d = await fetch("/api/parking").then(r => r.json()); setSpots(d); setShowCreate(false); setForm({ spotNumber: "", type: "standard", level: "", monthlyFee: "0" }); }
    } catch {} setCreating(false);
  }

  async function handleAssign() {
    if (!showAssign) return;
    const tenant = tenants.find(t => t.id === assignTenantId);
    await fetch("/api/parking", { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: showAssign.id, tenantId: assignTenantId || null, tenantName: tenant?.name || null, unit: tenant?.unit || null, status: assignTenantId ? "occupied" : "available" }) });
    const d = await fetch("/api/parking").then(r => r.json()); setSpots(d); setShowAssign(null); setAssignTenantId("");
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center"><Car className="w-5 h-5 text-sky-600" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Parking Management</h1><p className="text-slate-500 mt-0.5">Manage parking spots and assignments</p></div>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition flex items-center gap-2"><Plus className="w-4 h-4" /> Add Spot</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Total Spots</p><p className="text-2xl font-bold text-slate-900 mt-1">{spots.length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Occupied</p><p className="text-2xl font-bold text-sky-600 mt-1">{spots.filter(s => s.status === "occupied").length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Available</p><p className="text-2xl font-bold text-green-600 mt-1">{spots.filter(s => s.status === "available").length}</p></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {spots.map(s => (
          <button key={s.id} onClick={() => { setShowAssign(s); setAssignTenantId(s.tenantId || ""); }}
            className={cn("rounded-xl border-2 p-4 text-left transition hover:shadow-md", s.status === "occupied" ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white")}>
            <p className="text-lg font-bold text-slate-900">{s.spotNumber}</p>
            <p className="text-xs text-slate-500 capitalize">{s.type}{s.level ? ` — Level ${s.level}` : ""}</p>
            {s.tenantName ? <p className="text-sm text-sky-700 mt-2 font-medium">{s.tenantName}<br /><span className="text-xs text-slate-500">Unit {s.unit}</span></p> : <p className="text-sm text-green-600 mt-2 font-medium">Available</p>}
            {s.monthlyFee > 0 && <p className="text-xs text-slate-400 mt-1">${s.monthlyFee}/mo</p>}
          </button>
        ))}
        {spots.length === 0 && <div className="col-span-full bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No parking spots. Add some to get started.</div>}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Parking Spot</h3>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Spot Number *</label><input type="text" value={form.spotNumber} onChange={e => setForm({...form, spotNumber: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" placeholder="e.g. A-101" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"><option value="standard">Standard</option><option value="compact">Compact</option><option value="handicap">Handicap</option><option value="ev">EV Charging</option></select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Level</label><input type="text" value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" placeholder="e.g. B1" /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Fee ($)</label><input type="number" value={form.monthlyFee} onChange={e => setForm({...form, monthlyFee: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.spotNumber} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition disabled:opacity-50">{creating ? "Adding..." : "Add Spot"}</button>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Spot {showAssign.spotNumber}</h3>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Assign to Tenant</label>
              <select value={assignTenantId} onChange={e => setAssignTenantId(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none">
                <option value="">Unassigned (Available)</option>{tenants.map(t => <option key={t.id} value={t.id}>{t.name} — Unit {t.unit}</option>)}
              </select></div>
            <div className="flex gap-3">
              <button onClick={() => setShowAssign(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleAssign} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
