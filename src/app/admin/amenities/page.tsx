"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Plus, Trash2, Loader2 } from "lucide-react";

interface Amenity { id: string; name: string; description: string | null; location: string | null; capacity: number; availableFrom: string; availableTo: string; }

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", location: "", capacity: "", availableFrom: "08:00", availableTo: "22:00" });

  useEffect(() => { fetch("/api/amenities").then(r => r.ok ? r.json() : []).then(setAmenities).catch(() => []).finally(() => setLoading(false)); }, []);

  async function handleCreate() {
    if (!form.name) return; setCreating(true);
    try {
      const res = await fetch("/api/amenities", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, capacity: parseInt(form.capacity) || 0 }) });
      if (res.ok) { const d = await fetch("/api/amenities").then(r => r.json()); setAmenities(d); setShowCreate(false); setForm({ name: "", description: "", location: "", capacity: "", availableFrom: "08:00", availableTo: "22:00" }); }
    } catch {} setCreating(false);
  }

  async function handleDelete(id: string) { await fetch(`/api/amenities?id=${id}`, { method: "DELETE" }); setAmenities(prev => prev.filter(a => a.id !== id)); }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><CalendarDays className="w-5 h-5 text-indigo-600" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Amenities</h1><p className="text-slate-500 mt-0.5">Manage building amenities</p></div>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"><Plus className="w-4 h-4" /> Add Amenity</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-slate-900">{a.name}</h3>
              <button onClick={() => handleDelete(a.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
            {a.description && <p className="text-sm text-slate-500 mt-1">{a.description}</p>}
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              {a.location && <p>Location: {a.location}</p>}
              <p>Capacity: {a.capacity || "Unlimited"}</p>
              <p>Hours: {a.availableFrom} - {a.availableTo}</p>
            </div>
          </div>
        ))}
        {amenities.length === 0 && <div className="col-span-full bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No amenities. Add one to get started.</div>}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Amenity</h3>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label><input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Available From</label><input type="time" value={form.availableFrom} onChange={e => setForm({...form, availableFrom: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Available To</label><input type="time" value={form.availableTo} onChange={e => setForm({...form, availableTo: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.name} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">{creating ? "Adding..." : "Add Amenity"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
