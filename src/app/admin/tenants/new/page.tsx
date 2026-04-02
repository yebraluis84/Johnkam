"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Send } from "lucide-react";

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  }

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Send className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Invitation Sent!
          </h1>
          <p className="text-slate-500">
            An invitation email has been sent to the new tenant with their
            registration link and access code.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/admin/tenants"
              className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
            >
              View All Tenants
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tenants
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Tenant</h1>
          <p className="text-slate-500 mt-0.5">
            Create a new tenant account and send an invitation
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Personal Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="tenant@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Unit & Lease */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Unit & Lease Details
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Unit Number *
                </label>
                <select
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none"
                >
                  <option value="">Select unit</option>
                  <option value="1A">Unit 1A (Vacant)</option>
                  <option value="3B">Unit 3B (Vacant)</option>
                  <option value="6A">Unit 6A (Vacant)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Monthly Rent *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Lease Start Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Lease End Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Security Deposit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Move-In Date *
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Additional Notes
          </h2>
          <textarea
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            placeholder="Any special conditions, pet info, parking assignments, etc."
          />
        </div>

        {/* Send Invitation */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 mt-0.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Send invitation email
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                The tenant will receive an email with a link to create their
                account and set a password
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/tenants"
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "Creating..." : "Create Tenant & Send Invite"}
          </button>
        </div>
      </form>
    </div>
  );
}
