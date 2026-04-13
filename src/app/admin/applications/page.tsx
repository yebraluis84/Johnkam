"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2, XCircle, Clock, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Application { id: string; firstName: string; lastName: string; email: string; phone: string; currentAddress: string | null; employer: string | null; income: number | null; moveInDate: string | null; desiredUnit: string | null; message: string | null; status: string; reviewedBy: string | null; reviewNotes: string | null; createdAt: string; }

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => { fetch("/api/applications").then(r => r.ok ? r.json() : []).then(d => setApps(Array.isArray(d) ? d : [])).catch(() => []).finally(() => setLoading(false)); }, []);

  async function updateStatus(id: string, status: string) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    await fetch("/api/applications", { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, reviewedBy: user.name, reviewNotes }) });
    setApps(prev => prev.map(a => a.id === id ? { ...a, status, reviewedBy: user.name, reviewNotes } : a));
    setSelected(null); setReviewNotes("");
  }

  const statusColor = (s: string) => s === "approved" ? "bg-green-100 text-green-700" : s === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Rental Applications</h1><p className="text-slate-500 mt-0.5">Review prospective tenant applications</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-yellow-600 mt-1">{apps.filter(a => a.status === "pending").length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Approved</p><p className="text-2xl font-bold text-green-600 mt-1">{apps.filter(a => a.status === "approved").length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Rejected</p><p className="text-2xl font-bold text-red-600 mt-1">{apps.filter(a => a.status === "rejected").length}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Applicant</th><th className="text-left px-5 py-3 font-medium text-slate-600">Contact</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Desired Unit</th><th className="text-left px-5 py-3 font-medium text-slate-600">Income</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="text-left px-5 py-3 font-medium text-slate-600">Date</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{apps.map(a => (
            <tr key={a.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-900">{a.firstName} {a.lastName}</td>
              <td className="px-5 py-3 text-slate-600"><div>{a.email}</div><div className="text-xs text-slate-400">{a.phone}</div></td>
              <td className="px-5 py-3 text-slate-600">{a.desiredUnit || "—"}</td>
              <td className="px-5 py-3 text-slate-600">{a.income ? `$${a.income.toLocaleString()}` : "—"}</td>
              <td className="px-5 py-3"><span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusColor(a.status))}>{a.status}</span></td>
              <td className="px-5 py-3 text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-3"><button onClick={() => setSelected(a)} className="p-1 hover:bg-slate-100 rounded"><Eye className="w-4 h-4 text-slate-500" /></button></td>
            </tr>
          ))}{apps.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No applications</td></tr>}</tbody>
        </table></div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900">{selected.firstName} {selected.lastName}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-400">Email</p><p className="text-slate-700">{selected.email}</p></div>
              <div><p className="text-xs text-slate-400">Phone</p><p className="text-slate-700">{selected.phone}</p></div>
              <div><p className="text-xs text-slate-400">Employer</p><p className="text-slate-700">{selected.employer || "—"}</p></div>
              <div><p className="text-xs text-slate-400">Income</p><p className="text-slate-700">{selected.income ? `$${selected.income.toLocaleString()}/yr` : "—"}</p></div>
              <div><p className="text-xs text-slate-400">Desired Unit</p><p className="text-slate-700">{selected.desiredUnit || "—"}</p></div>
              <div><p className="text-xs text-slate-400">Move-in Date</p><p className="text-slate-700">{selected.moveInDate || "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-slate-400">Current Address</p><p className="text-slate-700">{selected.currentAddress || "—"}</p></div>
              {selected.message && <div className="col-span-2"><p className="text-xs text-slate-400">Message</p><p className="text-slate-700">{selected.message}</p></div>}
            </div>
            {selected.status === "pending" && (<>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Review Notes</label>
                <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none resize-none" /></div>
              <div className="flex gap-3">
                <button onClick={() => updateStatus(selected.id, "approved")} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Approve</button>
                <button onClick={() => updateStatus(selected.id, "rejected")} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Reject</button>
              </div>
            </>)}
            <button onClick={() => setSelected(null)} className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
