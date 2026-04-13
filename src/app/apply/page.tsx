"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const fd = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) setSubmitted(true); else setError("Failed to submit. Please try again.");
    } catch { setError("Network error. Please try again."); }
    setLoading(false);
  }

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Application Submitted!</h1>
        <p className="text-slate-500">Thank you for your interest. We&apos;ll review your application and get back to you within 2-3 business days.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4"><Building2 className="w-8 h-8 text-blue-600" /><span className="text-2xl font-bold text-slate-900">TenantHub</span></div>
          <h1 className="text-2xl font-bold text-slate-900">Rental Application</h1>
          <p className="text-slate-500 mt-1">Fill out the form below to apply for a unit</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label><input name="firstName" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label><input name="lastName" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label><input name="email" type="email" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label><input name="phone" type="tel" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Current Address</label><input name="currentAddress" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Employer</label><input name="employer" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Annual Income ($)</label><input name="income" type="number" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Desired Move-in Date</label><input name="moveInDate" type="date" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Desired Unit</label><input name="desiredUnit" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" placeholder="e.g. 2BR" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Message</label><textarea name="message" rows={3} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none resize-none" /></div>
          <button type="submit" disabled={loading} className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}{loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
