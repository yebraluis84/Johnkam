"use client";

import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Plus,
  CheckCircle2,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  label: string;
  checked: boolean;
}

interface Checklist {
  id: string;
  type: string;
  unitId: string | null;
  tenantId: string | null;
  tenantName: string | null;
  unitNumber: string | null;
  items: ChecklistItem[];
  notes: string | null;
  completedAt: string | null;
  completedBy: string | null;
  createdAt: string;
}

interface Tenant {
  id: string;
  name: string;
  unit: string;
}

const defaultMoveIn = [
  "Keys handed over",
  "Walk-through inspection completed",
  "Utilities transferred to tenant",
  "Welcome packet provided",
  "Parking pass issued",
  "Mailbox key provided",
  "Emergency contacts collected",
  "Lease signed and filed",
  "First month rent collected",
  "Security deposit collected",
];

const defaultMoveOut = [
  "30-day notice received",
  "Move-out inspection scheduled",
  "Walk-through inspection completed",
  "Keys returned",
  "Parking pass returned",
  "Mailbox key returned",
  "Utilities transfer confirmed",
  "Security deposit inspection done",
  "Forwarding address collected",
  "Unit cleaned and ready",
];

export default function AdminChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "move-in", tenantId: "", notes: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/checklists").then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/tenants").then((r) => r.ok ? r.json() : []).catch(() => []),
    ]).then(([cl, ten]) => {
      setChecklists(Array.isArray(cl) ? cl : []);
      setTenants(Array.isArray(ten) ? ten.map((t: Tenant) => ({ id: t.id, name: t.name, unit: t.unit })) : []);
    }).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    const tenant = tenants.find((t) => t.id === form.tenantId);
    if (!tenant) return;
    setCreating(true);
    const items = (form.type === "move-in" ? defaultMoveIn : defaultMoveOut).map((label) => ({ label, checked: false }));
    try {
      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          tenantId: tenant.id,
          tenantName: tenant.name,
          unitNumber: tenant.unit,
          items,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const data = await fetch("/api/checklists").then((r) => r.json());
        setChecklists(data);
        setShowCreate(false);
        setForm({ type: "move-in", tenantId: "", notes: "" });
      }
    } catch {}
    setCreating(false);
  }

  async function toggleItem(checklistId: string, itemIndex: number) {
    const cl = checklists.find((c) => c.id === checklistId);
    if (!cl) return;
    const updated = cl.items.map((item, i) => i === itemIndex ? { ...item, checked: !item.checked } : item);
    await fetch("/api/checklists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: checklistId, items: updated }),
    });
    setChecklists((prev) => prev.map((c) => c.id === checklistId ? { ...c, items: updated } : c));
  }

  async function markComplete(checklistId: string) {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await fetch("/api/checklists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: checklistId, completedBy: user.name || "Admin" }),
      });
      setChecklists((prev) => prev.map((c) =>
        c.id === checklistId ? { ...c, completedAt: new Date().toISOString(), completedBy: user.name || "Admin" } : c
      ));
    } catch {}
  }

  async function handleDelete(id: string) {
    await fetch(`/api/checklists?id=${id}`, { method: "DELETE" });
    setChecklists((prev) => prev.filter((c) => c.id !== id));
  }

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
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Move-In / Move-Out Checklists</h1>
            <p className="text-slate-500 mt-0.5">Track tenant transitions</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Checklist
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: checklists.length },
          { label: "Move-In", value: checklists.filter((c) => c.type === "move-in").length },
          { label: "Move-Out", value: checklists.filter((c) => c.type === "move-out").length },
          { label: "Completed", value: checklists.filter((c) => c.completedAt).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Checklists */}
      <div className="space-y-4">
        {checklists.map((cl) => {
          const progress = cl.items.length > 0 ? Math.round((cl.items.filter((i) => i.checked).length / cl.items.length) * 100) : 0;
          const isExpanded = expanded === cl.id;

          return (
            <div key={cl.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : cl.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    cl.type === "move-in" ? "bg-green-100" : "bg-orange-100"
                  )}>
                    <ClipboardCheck className={cn("w-5 h-5", cl.type === "move-in" ? "text-green-600" : "text-orange-600")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{cl.tenantName}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        cl.type === "move-in" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {cl.type === "move-in" ? "Move-In" : "Move-Out"}
                      </span>
                      {cl.completedAt && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Completed</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Unit {cl.unitNumber} &middot; {progress}% complete &middot; {new Date(cl.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 p-5 space-y-3">
                  {cl.items.map((item, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(cl.id, i)}
                        disabled={!!cl.completedAt}
                        className="w-4 h-4 rounded border-slate-300 text-green-600"
                      />
                      <span className={cn("text-sm", item.checked ? "text-slate-400 line-through" : "text-slate-700")}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                  {cl.notes && (
                    <p className="text-sm text-slate-500 mt-3 bg-slate-50 rounded-lg p-3">
                      <span className="font-medium">Notes:</span> {cl.notes}
                    </p>
                  )}
                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    {!cl.completedAt && (
                      <button
                        onClick={() => markComplete(cl.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cl.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {checklists.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No checklists yet. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900">New Checklist</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
              >
                <option value="move-in">Move-In</option>
                <option value="move-out">Move-Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tenant</label>
              <select
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
              >
                <option value="">Select tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} — Unit {t.unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none resize-none"
                placeholder="Any special notes..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.tenantId}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Checklist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
