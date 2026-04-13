"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Trash2, Loader2, Star, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface Vendor { id: string; name: string; company: string | null; email: string | null; phone: string | null; specialty: string; rating: number; notes: string | null; status: string; }

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", specialty: "", rating: "0", notes: "" });

  useEffect(() => { fetch("/api/vendors").then(r => r.ok ? r.json() : []).then(setVendors).catch(() => []).finally(() => setLoading(false)); }, []);

  async function handleCreate() {
    if (!form.name || !form.specialty) return; setCreating(true);
    try {
      const res = await fetch("/api/vendors", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating: parseInt(form.rating) || 0 }) });
      if (res.ok) { const d = await fetch("/api/vendors").then(r => r.json()); setVendors(d); setShowCreate(false); setForm({ name: "", company: "", email: "", phone: "", specialty: "", rating: "0", notes: "" }); }
    } catch {} setCreating(false);
  }

  async function handleDelete(id: string) { await fetch(`/api/vendors?id=${id}`, { method: "DELETE" }); setVendors(prev => prev.filter(v => v.id !== id)); }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"><Briefcase className="w-5 h-5 text-teal-600" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Vendors</h1><p className="text-slate-500 mt-0.5">Manage contractors and service providers</p></div>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center gap-2"><Plus className="w-4 h-4" /> Add Vendor</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{v.name}</h3>
                {v.company && <p className="text-sm text-slate-500">{v.company}</p>}
              </div>
              <button onClick={() => handleDelete(v.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">{v.specialty}</span>
            <div className="flex gap-1 mt-2">{[1,2,3,4,5].map(n => <Star key={n} className={cn("w-3.5 h-3.5", n <= v.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300")} />)}</div>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              {v.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{v.phone}</div>}
              {v.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{v.email}</div>}
            </div>
          </div>
        ))}
        {vendors.length === 0 && <div className="col-span-full bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No vendors. Add one to get started.</div>}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Vendor</h3>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label><input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Specialty *</label>
                <select value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="">Select</option><option value="Plumbing">Plumbing</option><option value="Electrical">Electrical</option><option value="HVAC">HVAC</option><option value="General">General</option><option value="Painting">Painting</option><option value="Landscaping">Landscaping</option><option value="Cleaning">Cleaning</option><option value="Pest Control">Pest Control</option>
                </select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none resize-none" /></div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.name || !form.specialty} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition disabled:opacity-50">{creating ? "Adding..." : "Add Vendor"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
