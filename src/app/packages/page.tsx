"use client";

import { useState, useEffect } from "react";
import { Package, CheckCircle2, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageItem { id: string; carrier: string; trackingNo: string | null; description: string | null; status: string; createdAt: string; pickedUpAt: string | null; }

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const unit = user.unit || "";
    if (!unit) { setLoading(false); return; }
    fetch(`/api/packages?unit=${unit}`).then(r => r.ok ? r.json() : []).then(setPackages).catch(() => []).finally(() => setLoading(false));
  }, []);

  async function markPickedUp(id: string) {
    await fetch("/api/packages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "picked_up" }) });
    setPackages(prev => prev.map(p => p.id === id ? { ...p, status: "picked_up", pickedUpAt: new Date().toISOString() } : p));
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-amber-600" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Packages</h1><p className="text-slate-500 mt-0.5">Track your deliveries</p></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Waiting for Pickup</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{packages.filter(p => p.status === "received").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Picked Up</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{packages.filter(p => p.status === "picked_up").length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100"><h2 className="font-semibold text-slate-900">All Packages</h2></div>
        <div className="divide-y divide-slate-100">
          {packages.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", p.status === "picked_up" ? "bg-green-100" : "bg-amber-100")}>
                  {p.status === "picked_up" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.carrier}{p.description ? ` — ${p.description}` : ""}</p>
                  <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}{p.trackingNo ? ` &middot; ${p.trackingNo}` : ""}</p>
                </div>
              </div>
              {p.status === "received" ? (
                <button onClick={() => markPickedUp(p.id)} className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition">Mark Picked Up</button>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Picked Up</span>
              )}
            </div>
          ))}
          {packages.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No packages</div>}
        </div>
      </div>
    </div>
  );
}
