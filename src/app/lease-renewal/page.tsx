"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ArrowRight,
} from "lucide-react";
import { leaseRenewals } from "@/lib/extended-data";
import { currentTenant } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function LeaseRenewalPage() {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(stored.name || "");
    } catch {}
  }, []);

  const myRenewal = leaseRenewals.find((r) => r.tenantName === userName || r.tenantName === "Sarah Johnson");

  const daysUntilExpiry = Math.ceil(
    (new Date(currentTenant.leaseEnd).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lease Renewal</h1>
          <p className="text-slate-500 mt-0.5">
            Review and manage your lease renewal
          </p>
        </div>
      </div>

      {/* Current Lease Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Current Lease</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400">Unit</p>
            <p className="text-sm font-medium text-slate-900">{currentTenant.unit}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Lease Period</p>
            <p className="text-sm font-medium text-slate-900">
              {formatDate(currentTenant.leaseStart)} — {formatDate(currentTenant.leaseEnd)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Monthly Rent</p>
            <p className="text-sm font-medium text-slate-900">
              {formatCurrency(currentTenant.rentAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Expires In</p>
            <p className={cn(
              "text-sm font-medium",
              daysUntilExpiry < 60 ? "text-red-600" : daysUntilExpiry < 120 ? "text-yellow-600" : "text-green-600"
            )}>
              {daysUntilExpiry} days
            </p>
          </div>
        </div>

        {/* Expiry Timeline */}
        <div className="mt-5">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                daysUntilExpiry < 60 ? "bg-red-500" : daysUntilExpiry < 120 ? "bg-yellow-500" : "bg-green-500"
              )}
              style={{ width: `${Math.max(5, Math.min(100, ((365 - daysUntilExpiry) / 365) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>Lease Start</span>
            <span>Expiration</span>
          </div>
        </div>
      </div>

      {/* Renewal Offer */}
      {myRenewal && myRenewal.status === "offered" && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-200" />
            <h2 className="font-semibold">Renewal Offer Available</h2>
          </div>
          <p className="text-blue-100 text-sm mb-4">
            Your property management has sent you a renewal offer. Review the terms below.
          </p>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-200">New Lease Period</p>
                <p className="text-sm font-medium">
                  {formatDate(myRenewal.newLeaseStart)} — {formatDate(myRenewal.newLeaseEnd)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-200">Proposed Rent</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {formatCurrency(myRenewal.proposedRent)}/mo
                  </p>
                  {myRenewal.proposedRent === myRenewal.currentRent ? (
                    <span className="text-xs bg-green-500/20 text-green-200 px-2 py-0.5 rounded-full">
                      Same rate
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full">
                      +{formatCurrency(myRenewal.proposedRent - myRenewal.currentRent)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-blue-200">Offered On</p>
              <p className="text-sm font-medium">{formatDate(myRenewal.offeredDate!)}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowAcceptModal(true)}
              className="px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept Renewal
            </button>
            <button className="px-5 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition">
              Decline
            </button>
            <button className="px-5 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition">
              Request Changes
            </button>
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">
              Confirm Lease Renewal
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">New Period</span>
                <span className="text-slate-700">
                  {formatDate(myRenewal!.newLeaseStart)} — {formatDate(myRenewal!.newLeaseEnd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Rent</span>
                <span className="text-slate-700 font-medium">
                  {formatCurrency(myRenewal!.proposedRent)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              By accepting, you agree to the renewal terms. A new lease document will be generated for your signature.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              >
                Confirm & Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Renewal Timeline</h2>
        <div className="space-y-0">
          {[
            { step: "Renewal Offer Sent", date: "Apr 1, 2026", status: "complete" as const, desc: "Management sent a renewal offer" },
            { step: "Tenant Review", date: "Current", status: "current" as const, desc: "Review and respond to the offer" },
            { step: "Lease Document Generated", date: "Pending", status: "pending" as const, desc: "New lease prepared for signing" },
            { step: "E-Signature", date: "Pending", status: "pending" as const, desc: "Sign the renewal digitally" },
            { step: "Renewal Complete", date: "Pending", status: "pending" as const, desc: "New lease term begins" },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    item.status === "complete"
                      ? "bg-green-100 text-green-600"
                      : item.status === "current"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  {item.status === "complete" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : item.status === "current" ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
                {i < arr.length - 1 && (
                  <div className={cn(
                    "w-px h-10",
                    item.status === "complete" ? "bg-green-200" : "bg-slate-200"
                  )} />
                )}
              </div>
              <div className="pb-8">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "text-sm font-medium",
                    item.status === "pending" ? "text-slate-400" : "text-slate-900"
                  )}>
                    {item.step}
                  </p>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
