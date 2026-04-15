"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

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
      else setError("Failed to submit. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">
            Application Submitted!
          </h1>
          <p className="text-slate-500">
            Thank you for your interest. Your background check will be processed
            as part of your application. We&apos;ll review everything and get
            back to you within 2-3 business days.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name *
                </label>
                <input
                  name="lastName"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Current Address
              </label>
              <input
                name="currentAddress"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Employment & Financial */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Annual Income ($)
                </label>
                <input
                  name="income"
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Desired Unit
                </label>
                <input
                  name="desiredUnit"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none resize-none"
              />
            </div>
          </div>

          {/* Background Check Consent */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Background Check Authorization
              </h2>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 leading-relaxed">
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
            className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
