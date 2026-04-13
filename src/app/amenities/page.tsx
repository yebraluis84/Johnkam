"use client";

import { useState, useEffect } from "react";
import { CalendarDays, MapPin, Users, Clock, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Amenity { id: string; name: string; description: string | null; location: string | null; capacity: number; availableFrom: string; availableTo: string; rules: string | null; }
interface Booking { id: string; amenityName: string; date: string; startTime: string; endTime: string; status: string; }

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState<Amenity | null>(null);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "", notes: "" });
  const [tenantId, setTenantId] = useState(""); const [tenantName, setTenantName] = useState(""); const [unit, setUnit] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setTenantId(user.tenantId || ""); setTenantName(user.name || ""); setUnit(user.unit || "");
    Promise.all([
      fetch("/api/amenities").then(r => r.ok ? r.json() : []).catch(() => []),
      user.tenantId ? fetch(`/api/amenities/bookings?tenantId=${user.tenantId}`).then(r => r.ok ? r.json() : []).catch(() => []) : [],
    ]).then(([am, bk]) => { setAmenities(am); setMyBookings(bk); }).finally(() => setLoading(false));
  }, []);

  async function handleBook() {
    if (!showBook || !form.date || !form.startTime || !form.endTime) return;
    setBooking(true);
    try {
      const res = await fetch("/api/amenities/bookings", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amenityId: showBook.id, tenantId, tenantName, unit, ...form }) });
      if (res.ok) {
        const bk = await fetch(`/api/amenities/bookings?tenantId=${tenantId}`).then(r => r.json());
        setMyBookings(bk); setShowBook(null); setForm({ date: "", startTime: "", endTime: "", notes: "" });
      }
    } catch {} setBooking(false);
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><CalendarDays className="w-5 h-5 text-indigo-600" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Amenities</h1><p className="text-slate-500 mt-0.5">Book community spaces and amenities</p></div>
      </div>

      {myBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">My Bookings</h2>
          <div className="space-y-2">
            {myBookings.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5">
                <div><p className="text-sm font-medium text-slate-900">{b.amenityName}</p><p className="text-xs text-slate-500">{b.date} &middot; {b.startTime} - {b.endTime}</p></div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-semibold text-slate-900">{a.name}</h3>
            {a.description && <p className="text-sm text-slate-500">{a.description}</p>}
            <div className="space-y-1 text-xs text-slate-500">
              {a.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</div>}
              {a.capacity > 0 && <div className="flex items-center gap-1"><Users className="w-3 h-3" />Capacity: {a.capacity}</div>}
              <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.availableFrom} - {a.availableTo}</div>
            </div>
            <button onClick={() => setShowBook(a)} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Book Now
            </button>
          </div>
        ))}
        {amenities.length === 0 && <div className="col-span-full bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No amenities available</div>}
      </div>

      {showBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900">Book {showBook.name}</h3>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label><input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label><input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label><input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" placeholder="Any special requests..." /></div>
            <div className="flex gap-3">
              <button onClick={() => setShowBook(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleBook} disabled={booking || !form.date} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">{booking ? "Booking..." : "Confirm Booking"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
