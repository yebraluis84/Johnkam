"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("You must consent to the background check to proceed.");
      return;
    }
    setLoading(true);
    setError("");
    const fd = new FormData(e.target as HTMLFormElement);
    const data: Record<string, string | boolean> = {};
    fd.forEach((v, k) => { data[k] = v as string; });
    data.consentGiven = consent;
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setSubmitted(true);
      else {
        const err = await res.json().catch(() => null);
        setError(err?.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center space-y-5 shadow-xl shadow-slate-200/50">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/25">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Application Submitted!
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Thank you for your interest. Your background check will be processed
            as part of your application. We&apos;ll review everything and get
            back to you within 2-3 business days.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">TenantHub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Rental Application
          </h1>
          <p className="text-slate-500 mt-1">
            Fill out the form below to apply for a unit
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name *
                </label>
                <input
                  name="firstName"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name *
                </label>
                <input
                  name="lastName"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Current Address
              </label>
              <input
                name="currentAddress"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date of Birth *
                </label>
                <input
                  name="dateOfBirth"
                  type="date"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  SSN (Last 4 digits) *
                </label>
                <input
                  name="ssnLast4"
                  type="text"
                  required
                  maxLength={4}
                  pattern="[0-9]{4}"
                  placeholder="XXXX"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Employment & Financial */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-slate-900">
              Employment & Financial
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Employer
                </label>
                <input
                  name="employer"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Annual Income ($)
                </label>
                <input
                  name="income"
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Desired Move-in Date
                </label>
                <input
                  name="moveInDate"
                  type="date"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Desired Unit
                </label>
                <input
                  name="desiredUnit"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
                  placeholder="e.g. 2BR"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Additional Message
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm"
              />
            </div>
          </div>

          {/* Background Check Consent */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Background Check Authorization
              </h2>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed border border-slate-100">
              <p>
                As part of the application process, we conduct a background
                screening that may include:
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Credit history check</li>
                <li>Criminal background check</li>
                <li>Eviction history search</li>
                <li>Identity verification</li>
              </ul>
              <p className="mt-3">
                Your personal information is handled securely and used only for
                the purpose of evaluating your rental application. Results are
                shared only with authorized property management staff.
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 rounded text-blue-600"
              />
              <span className="text-sm text-slate-700">
                I authorize TenantHub and its property management to obtain a
                consumer report and/or investigative consumer report for the
                purpose of evaluating my rental application. I understand that
                this may include a credit check, criminal background check,
                eviction history, and identity verification. *
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !consent}
            className="w-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
