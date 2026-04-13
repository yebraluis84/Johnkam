"use client";

import { useState, useEffect } from "react";
import { Shield, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tenant { id: string; name: string; unit: string; insuranceProvider: string | null; insurancePolicyNo: string | null; insuranceExpiry: string | null; }

export default function AdminInsurancePage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenants").then(r => r.ok ? r.json() : [])
      .then(d => setTenants(Array.isArray(d) ? d.map((t: Record<string, unknown>) => ({
        id: t.id as string, name: t.name as string, unit: t.unit as string,
        insuranceProvider: (t.insuranceProvider as string) || null,
        insurancePolicyNo: (t.insurancePolicyNo as string) || null,
        insuranceExpiry: (t.insuranceExpiry as string) || null,
      })) : []))
      .catch(() => [])
      .finally(() => setLoading(false));
  }, []);

  const compliant = tenants.filter(t => t.insuranceProvider && t.insuranceExpiry && new Date(t.insuranceExpiry) > new Date());
  const expired = tenants.filter(t => t.insuranceExpiry && new Date(t.insuranceExpiry) <= new Date());
  const missing = tenants.filter(t => !t.insuranceProvider);

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-emerald-600" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Insurance Tracking</h1><p className="text-slate-500 mt-0.5">Monitor renter&apos;s insurance compliance</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Compliant</p><p className="text-2xl font-bold text-green-600 mt-1">{compliant.length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Expired</p><p className="text-2xl font-bold text-red-600 mt-1">{expired.length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Missing</p><p className="text-2xl font-bold text-yellow-600 mt-1">{missing.length}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Tenant</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Unit</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Provider</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Policy #</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Expiry</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{tenants.map(t => {
            const isExpired = t.insuranceExpiry && new Date(t.insuranceExpiry) <= new Date();
            const isMissing = !t.insuranceProvider;
            return (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{t.name}</td>
                <td className="px-5 py-3 text-slate-600">{t.unit}</td>
                <td className="px-5 py-3 text-slate-600">{t.insuranceProvider || "—"}</td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{t.insurancePolicyNo || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{t.insuranceExpiry ? new Date(t.insuranceExpiry).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3">
                  {isMissing ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><AlertTriangle className="w-3 h-3" /> Missing</span>
                  ) : isExpired ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" /> Expired</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Active</span>
                  )}
                </td>
              </tr>
            );
          })}{tenants.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No tenants</td></tr>}</tbody>
        </table></div>
      </div>
    </div>
  );
}
