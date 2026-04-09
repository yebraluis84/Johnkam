"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface RenewalOffer {
  id: string;
  tenantId: string;
  currentLeaseEnd: string;
  newLeaseStart: string;
  newLeaseEnd: string;
  currentRent: number;
  proposedRent: number;
  status: string;
  offeredDate: string | null;
  respondedDate: string | null;
}

interface LeaseInfo {
  leaseStart: string;
  leaseEnd: string;
  unit: string;
  rentAmount: number;
}

export default function LeaseRenewalPage() {
  const [renewal, setRenewal] = useState<RenewalOffer | null>(null);
  const [lease, setLease] = useState<LeaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [responseStatus, setResponseStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const tId = user.tenantId || "";
      if (!tId) { setLoading(false); return; }

      Promise.all([
        fetch(`/api/lease-renewals?tenantId=${tId}`).then((r) => r.ok ? r.json() : []).catch(() => []),
        fetch("/api/tenants").then((r) => r.ok ? r.json() : []).catch(() => []),
      ]).then(([renewals, tenants]) => {
        const offered = Array.isArray(renewals) ? renewals.find((r: RenewalOffer) => r.status === "offered") : null;
        const accepted = Array.isArray(renewals) ? renewals.find((r: RenewalOffer) => r.status === "accepted") : null;
        setRenewal(offered || accepted || (Array.isArray(renewals) ? renewals[0] : null));

        if (tId && Array.isArray(tenants)) {
          const me = tenants.find((t: { id: string }) => t.id === tId);
          if (me) {
            setLease({
              leaseStart: me.leaseStart,
              leaseEnd: me.leaseEnd,
              unit: me.unit,
              rentAmount: me.rentAmount,
            });
          }
        }
      }).finally(() => setLoading(false));
    } catch { setLoading(false); }
  }, []);

  const daysUntilExpiry = lease?.leaseEnd
    ? Math.ceil((new Date(lease.leaseEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  async function handleRespond(status: "accepted" | "declined") {
    if (!renewal) return;
    setResponding(true);
    try {
      const res = await fetch("/api/lease-renewals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: renewal.id, status }),
      });
      if (res.ok) {
        setRenewal({ ...renewal, status, respondedDate: new Date().toISOString().split("T")[0] });
        setResponseStatus(status);
        setShowAcceptModal(false);
      }
    } catch {}
    setResponding(false);
  }

  function fmtDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lease Renewal</h1>
          <p className="text-slate-500 mt-0.5">Review and manage your lease renewal</p>
        </div>
      </div>

      {/* Current Lease Status */}
      {lease && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Current Lease</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400">Unit</p>
              <p className="text-sm font-medium text-slate-900">{lease.unit}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Lease Period</p>
              <p className="text-sm font-medium text-slate-900">
                {fmtDate(lease.leaseStart)} — {fmtDate(lease.leaseEnd)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Monthly Rent</p>
              <p className="text-sm font-medium text-slate-900">{formatCurrency(lease.rentAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Expires In</p>
              {daysUntilExpiry !== null ? (
                <p className={cn(
                  "text-sm font-medium",
                  daysUntilExpiry < 60 ? "text-red-600" : daysUntilExpiry < 120 ? "text-yellow-600" : "text-green-600"
                )}>
                  {daysUntilExpiry} days
                </p>
              ) : (
                <p className="text-sm font-medium text-slate-400">--</p>
              )}
            </div>
          </div>

          {daysUntilExpiry !== null && (
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
          )}
        </div>
      )}

      {/* Success response */}
      {responseStatus && (
        <div className={cn(
          "rounded-xl p-5 flex items-center gap-3",
          responseStatus === "accepted" ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200"
        )}>
          {responseStatus === "accepted" ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-slate-500" />
          )}
          <div>
            <p className="font-semibold text-slate-900">
              {responseStatus === "accepted" ? "Renewal Accepted!" : "Renewal Declined"}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {responseStatus === "accepted"
                ? "Your lease has been renewed. Updated terms are now in effect."
                : "You have declined the renewal offer. Contact management for questions."}
            </p>
          </div>
        </div>
      )}

      {/* Renewal Offer */}
      {renewal && renewal.status === "offered" && !responseStatus && (
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
                  {fmtDate(renewal.newLeaseStart)} — {fmtDate(renewal.newLeaseEnd)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-200">Proposed Rent</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{formatCurrency(renewal.proposedRent)}/mo</p>
                  {renewal.proposedRent === renewal.currentRent ? (
                    <span className="text-xs bg-green-500/20 text-green-200 px-2 py-0.5 rounded-full">Same rate</span>
                  ) : (
                    <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full">
                      +{formatCurrency(renewal.proposedRent - renewal.currentRent)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {renewal.offeredDate && (
              <div>
                <p className="text-xs text-blue-200">Offered On</p>
                <p className="text-sm font-medium">{fmtDate(renewal.offeredDate)}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowAcceptModal(true)}
              className="px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept Renewal
            </button>
            <button
              onClick={() => handleRespond("declined")}
              disabled={responding}
              className="px-5 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* No offer */}
      {!renewal && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No renewal offers at this time.</p>
          <p className="text-sm text-slate-400 mt-1">
            Your property management will send you an offer when your lease is up for renewal.
          </p>
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && renewal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Confirm Lease Renewal</h3>
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">New Period</span>
                <span className="text-slate-700">{fmtDate(renewal.newLeaseStart)} — {fmtDate(renewal.newLeaseEnd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Rent</span>
                <span className="text-slate-700 font-medium">{formatCurrency(renewal.proposedRent)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              By accepting, you agree to the renewal terms. Your lease dates and rent will be updated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRespond("accepted")}
                disabled={responding}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {responding ? "Processing..." : "Confirm & Accept"}
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
            {
              step: "Renewal Offer Sent",
              date: renewal?.offeredDate ? fmtDate(renewal.offeredDate) : "Pending",
              status: renewal ? "complete" as const : "pending" as const,
              desc: "Management sends a renewal offer",
            },
            {
              step: "Tenant Review",
              date: renewal?.status === "offered" ? "Current" : renewal?.respondedDate ? fmtDate(renewal.respondedDate) : "Pending",
              status: renewal?.status === "offered" ? "current" as const : renewal?.respondedDate ? "complete" as const : "pending" as const,
              desc: "Review and respond to the offer",
            },
            {
              step: "Lease Updated",
              date: renewal?.status === "accepted" ? "Complete" : "Pending",
              status: renewal?.status === "accepted" ? "complete" as const : "pending" as const,
              desc: "New lease terms take effect",
            },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  item.status === "complete" ? "bg-green-100 text-green-600"
                    : item.status === "current" ? "bg-blue-100 text-blue-600"
                    : "bg-slate-100 text-slate-400"
                )}>
                  {item.status === "complete" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : item.status === "current" ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
                {i < arr.length - 1 && (
                  <div className={cn("w-px h-10", item.status === "complete" ? "bg-green-200" : "bg-slate-200")} />
                )}
              </div>
              <div className="pb-8">
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm font-medium", item.status === "pending" ? "text-slate-400" : "text-slate-900")}>
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
