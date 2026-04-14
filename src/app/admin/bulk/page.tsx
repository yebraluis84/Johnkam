"use client";

import { useState, useEffect } from "react";
import {
  Send,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Users,
  Mail,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TenantInfo {
  id: string;
  name: string;
  unit: string;
  email: string;
  rentAmount: number;
  balance: number;
  status: string;
}

type ActionTab = "notices" | "rent" | "late-fees" | "reminders";

export default function BulkActionsPage() {
  const [tab, setTab] = useState<ActionTab>("notices");
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Notice form
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Rent form
  const [adjustType, setAdjustType] = useState("percentage");
  const [adjustValue, setAdjustValue] = useState("");

  useEffect(() => {
    fetch("/api/tenants").then((r) => r.ok ? r.json() : []).then((data) => {
      if (Array.isArray(data)) setTenants(data.filter((t: TenantInfo) => t.status === "active"));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  function selectAll() {
    setSelected(selected.length === tenants.length ? [] : tenants.map((t) => t.id));
  }

  async function sendNotices() {
    if (!subject || !message) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-notice", subject, message, tenantIds: selected.length > 0 ? selected : undefined }),
      });
      const data = await res.json();
      setResult(data.success ? `Sent to ${data.sent} tenants` : data.error);
    } catch { setResult("Failed to send"); }
    setSending(false);
  }

  async function updateRent() {
    if (!adjustValue || selected.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-rent", tenantIds: selected, adjustmentType: adjustType, adjustmentValue: adjustValue }),
      });
      const data = await res.json();
      setResult(data.success ? `Updated rent for ${data.updated} tenants` : data.error);
    } catch { setResult("Failed to update"); }
    setSending(false);
  }

  async function applyLateFees() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply-late-fees" }),
      });
      const data = await res.json();
      setResult(data.applied > 0 ? `Applied $${data.feeAmount} late fee to ${data.applied} tenants` : data.message || "No fees applied");
    } catch { setResult("Failed"); }
    setSending(false);
  }

  async function sendReminders() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/reminders", { method: "POST" });
      const data = await res.json();
      setResult(data.sent > 0 ? `Sent ${data.sent} reminders` : data.message || "No reminders sent");
    } catch { setResult("Failed"); }
    setSending(false);
  }

  const tabs: { id: ActionTab; label: string; icon: typeof Send }[] = [
    { id: "notices", label: "Send Notices", icon: Mail },
    { id: "rent", label: "Update Rent", icon: TrendingUp },
    { id: "late-fees", label: "Apply Late Fees", icon: AlertTriangle },
    { id: "reminders", label: "Rent Reminders", icon: Send },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Actions</h1>
          <p className="text-slate-500 mt-0.5">Manage multiple tenants at once</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null); }} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors", tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Result Alert */}
      {result && (
        <div className={cn("flex items-center gap-2 p-4 rounded-lg text-sm", result.includes("Failed") || result.includes("error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
          <CheckCircle2 className="w-4 h-4" /> {result}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            {tab === "notices" && (
              <>
                <h3 className="font-semibold text-slate-900">Send Bulk Notice</h3>
                <p className="text-xs text-slate-500">Email selected tenants (or all if none selected)</p>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message body..." rows={5} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <button onClick={sendNotices} disabled={sending || !subject || !message} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send to {selected.length || "All"} Tenant{(selected.length || tenants.length) !== 1 ? "s" : ""}
                </button>
              </>
            )}

            {tab === "rent" && (
              <>
                <h3 className="font-semibold text-slate-900">Bulk Rent Update</h3>
                <p className="text-xs text-slate-500">Select tenants below, then adjust rent</p>
                <select value={adjustType} onChange={(e) => setAdjustType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="percentage">Percentage Increase (%)</option>
                  <option value="increase">Fixed Increase ($)</option>
                  <option value="fixed">Set Fixed Amount ($)</option>
                </select>
                <input type="number" step="0.01" value={adjustValue} onChange={(e) => setAdjustValue(e.target.value)} placeholder={adjustType === "percentage" ? "e.g., 3.5" : "e.g., 50"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <button onClick={updateRent} disabled={sending || !adjustValue || selected.length === 0} className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                  Update {selected.length} Tenant{selected.length !== 1 ? "s" : ""}
                </button>
              </>
            )}

            {tab === "late-fees" && (
              <>
                <h3 className="font-semibold text-slate-900">Apply Late Fees</h3>
                <p className="text-xs text-slate-500">Apply late fees to all tenants with overdue balances past the grace period</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    This will charge the configured late fee to all overdue tenants
                  </div>
                </div>
                <button onClick={applyLateFees} disabled={sending} className="w-full py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Apply Late Fees
                </button>
              </>
            )}

            {tab === "reminders" && (
              <>
                <h3 className="font-semibold text-slate-900">Send Rent Reminders</h3>
                <p className="text-xs text-slate-500">Email all tenants with outstanding balances a payment reminder</p>
                <button onClick={sendReminders} disabled={sending} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Reminders
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tenant Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-900">Tenants</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{selected.length} selected</span>
              </div>
              <button onClick={selectAll} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                {selected.length === tenants.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading...</div>
              ) : tenants.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No active tenants</div>
              ) : tenants.map((t) => (
                <label key={t.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)} className="rounded text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">Unit {t.unit} &middot; {t.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">${t.rentAmount.toFixed(2)}</p>
                    {t.balance > 0 && <p className="text-xs text-red-600">Owes ${t.balance.toFixed(2)}</p>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
