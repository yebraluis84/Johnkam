"use client";

import { useState, useEffect } from "react";
import { DollarSign, CreditCard, Building2, CheckCircle2, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentRecord {
  id: string; amount: number; description: string; method: string;
  status: string; confirmationNumber: string | null; createdAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ amount: "", method: "ach", description: "Rent Payment" });
  const [tenantId, setTenantId] = useState("");
  const [balance, setBalance] = useState(0);
  const [rentAmount, setRentAmount] = useState(0);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const tId = user.tenantId || "";
      setTenantId(tId);
      if (!tId) { setLoading(false); return; }

      Promise.all([
        fetch(`/api/payments?tenantId=${tId}`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch("/api/tenants").then(r => r.ok ? r.json() : []).catch(() => []),
      ]).then(([pays, tenants]) => {
        setPayments(Array.isArray(pays) ? pays : []);
        const me = Array.isArray(tenants) ? tenants.find((t: { id: string }) => t.id === tId) : null;
        if (me) { setBalance(me.balance || 0); setRentAmount(me.rentAmount || 0); setForm(f => ({ ...f, amount: String(me.rentAmount || "") })); }
      }).finally(() => setLoading(false));
    } catch { setLoading(false); }
  }, []);

  async function handlePay() {
    if (!form.amount || !tenantId) return;
    setPaying(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tenantId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(data.confirmationNumber);
        setShowPay(false);
        setBalance(b => b - parseFloat(form.amount));
        const updated = await fetch(`/api/payments?tenantId=${tenantId}`).then(r => r.json());
        setPayments(updated);
      }
    } catch {}
    setPaying(false);
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Payments</h1><p className="text-slate-500 mt-0.5">Manage your rent payments</p></div>
        </div>
        <button onClick={() => setShowPay(true)} className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Make Payment
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div><p className="font-semibold text-green-900">Payment Successful!</p><p className="text-sm text-green-700">Confirmation: {success}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Monthly Rent</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">${rentAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Current Balance</p>
          <p className={cn("text-2xl font-bold mt-1", balance > 0 ? "text-red-600" : "text-green-600")}>${balance.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Paid</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">${payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Payment History</h2></div>
        <div className="divide-y divide-slate-100">
          {payments.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", p.status === "completed" ? "bg-green-100" : "bg-yellow-100")}>
                  {p.status === "completed" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-yellow-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.description}</p>
                  <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()} &middot; {p.method.toUpperCase()} {p.confirmationNumber ? `&middot; ${p.confirmationNumber}` : ""}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-900">${p.amount.toFixed(2)}</p>
            </div>
          ))}
          {payments.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No payment history</div>}
        </div>
      </div>

      {showPay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> Make a Payment</h3>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Amount ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
              <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none">
                <option value="ach">ACH / Bank Transfer</option><option value="credit_card">Credit Card</option><option value="check">Check</option>
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div className="flex gap-3">
              <button onClick={() => setShowPay(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handlePay} disabled={paying || !form.amount} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                {paying ? "Processing..." : `Pay $${form.amount || "0"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
