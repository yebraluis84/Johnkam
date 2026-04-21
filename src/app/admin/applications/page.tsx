"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  UserCheck,
  Search,
  Briefcase,
  DollarSign,
  Home,
  UserPlus,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentAddress: string | null;
  employer: string | null;
  income: number | null;
  moveInDate: string | null;
  desiredUnit: string | null;
  message: string | null;
  status: string;
  reviewedBy: string | null;
  reviewNotes: string | null;
  dateOfBirth: string | null;
  ssnLast4: string | null;
  consentGiven: boolean;
  screeningStatus: string | null;
  screeningResult: string | null;
  screeningDate: string | null;
  creditScore: number | null;
  criminalClear: boolean | null;
  evictionClear: boolean | null;
  identityVerified: boolean | null;
  incomeVerified: boolean | null;
  employmentVerified: boolean | null;
  landlordReference: string | null;
  landlordRefVerified: boolean | null;
  screeningScore: number | null;
  screeningNotes: string | null;
  convertedToTenantId: string | null;
  createdAt: string;
}

interface VacantUnit {
  id: string;
  number: string;
  rent: number;
  status: string;
}

function computeManualScore(a: Application): number {
  let score = 0;
  if (a.creditScore && a.creditScore >= 750) score += 25;
  else if (a.creditScore && a.creditScore >= 700) score += 20;
  else if (a.creditScore && a.creditScore >= 650) score += 15;
  else if (a.creditScore && a.creditScore >= 620) score += 10;
  if (a.criminalClear) score += 15;
  if (a.evictionClear) score += 15;
  if (a.identityVerified) score += 10;
  if (a.incomeVerified) score += 15;
  if (a.employmentVerified) score += 10;
  if (a.landlordRefVerified) score += 10;
  return score;
}

function recommendation(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Strong Approve", color: "bg-green-100 text-green-700" };
  if (score >= 60) return { label: "Approve", color: "bg-emerald-100 text-emerald-700" };
  if (score >= 40) return { label: "Review Carefully", color: "bg-amber-100 text-amber-700" };
  return { label: "Recommend Reject", color: "bg-red-100 text-red-700" };
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [units, setUnits] = useState<VacantUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [screening, setScreening] = useState(false);
  const [converting, setConverting] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [convertUnit, setConvertUnit] = useState("");
  const [convertRent, setConvertRent] = useState("");
  const [convertLeaseStart, setConvertLeaseStart] = useState("");
  const [convertLeaseEnd, setConvertLeaseEnd] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/applications").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/units").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([a, u]) => {
        setApps(Array.isArray(a) ? a : []);
        const vacant = Array.isArray(u)
          ? u.filter((x: VacantUnit) => x.status === "available")
          : [];
        setUnits(vacant);
      })
      .catch(() => [])
      .finally(() => setLoading(false));
  }, []);

  function patchApp(id: string, patch: Partial<Application>) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    if (selected && selected.id === id) {
      setSelected((prev) => (prev ? { ...prev, ...patch } : null));
    }
    return fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
  }

  async function updateStatus(id: string, status: string) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    await patchApp(id, { status, reviewedBy: user.name, reviewNotes });
    setReviewNotes("");
  }

  async function toggleCheck(id: string, field: keyof Application, value: boolean) {
    await patchApp(id, { [field]: value } as Partial<Application>);
  }

  async function saveLandlordRef(id: string, value: string) {
    await patchApp(id, { landlordReference: value });
  }

  async function saveScreeningNotes(id: string, value: string) {
    await patchApp(id, { screeningNotes: value });
  }

  async function runScreening(id: string) {
    setScreening(true);
    try {
      const res = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      });
      if (res.ok) {
        const result = await res.json();
        const patch: Partial<Application> = {
          screeningStatus: "completed",
          screeningResult: result.result,
          screeningDate: new Date().toISOString(),
          creditScore: result.creditScore,
          criminalClear: result.criminalClear,
          evictionClear: result.evictionClear,
          identityVerified: result.identityVerified,
          screeningScore: result.screeningScore,
        };
        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
        if (selected && selected.id === id) {
          setSelected((prev) => (prev ? { ...prev, ...patch } : null));
        }
      }
    } catch {
      // screening failed silently
    }
    setScreening(false);
  }

  async function convertToTenant() {
    if (!selected) return;
    setConverting(true);
    try {
      const res = await fetch("/api/applications/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selected.id,
          unitNumber: convertUnit || null,
          rent: convertRent ? parseFloat(convertRent) : null,
          leaseStart: convertLeaseStart || null,
          leaseEnd: convertLeaseEnd || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApps((prev) =>
          prev.map((a) =>
            a.id === selected.id ? { ...a, convertedToTenantId: data.tenantId } : a
          )
        );
        setSelected((prev) =>
          prev ? { ...prev, convertedToTenantId: data.tenantId } : null
        );
        setShowConvert(false);
        setConvertUnit("");
        setConvertRent("");
        setConvertLeaseStart("");
        setConvertLeaseEnd("");
      } else {
        alert(data.error || "Failed to convert");
      }
    } catch (err) {
      alert("Failed to convert: " + String(err));
    }
    setConverting(false);
  }

  const statusColor = (s: string) =>
    s === "approved"
      ? "bg-green-100 text-green-700"
      : s === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  const screeningBadge = (s: string | null) => {
    if (!s || s === "not_started")
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
          Not Started
        </span>
      );
    if (s === "in_progress")
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          In Progress
        </span>
      );
    if (s === "completed")
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Completed
        </span>
      );
    return null;
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );

  const score = selected ? computeManualScore(selected) : 0;
  const rec = recommendation(score);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Rental Applications
          </h1>
          <p className="text-slate-500 mt-0.5">
            Review applications, run background checks, and onboard tenants
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {apps.filter((a) => a.status === "pending").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {apps.filter((a) => a.status === "approved").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {apps.filter((a) => a.status === "rejected").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Converted</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {apps.filter((a) => a.convertedToTenantId).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Applicant</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Contact</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Desired Unit</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Income</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Score</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Screening</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apps.map((a) => {
                const s = computeManualScore(a);
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {a.firstName} {a.lastName}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <div>{a.email}</div>
                      <div className="text-xs text-slate-400">{a.phone}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{a.desiredUnit || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {a.income ? `$${a.income.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-full text-xs font-bold",
                          s >= 80 ? "bg-green-100 text-green-700" :
                          s >= 60 ? "bg-emerald-100 text-emerald-700" :
                          s >= 40 ? "bg-amber-100 text-amber-700" :
                          s > 0 ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-400"
                        )}
                      >
                        {s > 0 ? s : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">{screeningBadge(a.screeningStatus)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-medium",
                          statusColor(a.status)
                        )}
                      >
                        {a.status}
                      </span>
                      {a.convertedToTenantId && (
                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          tenant
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelected(a)}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-400">
                    No applications
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selected.firstName} {selected.lastName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", rec.color)}>
                  {rec.label}
                </span>
                <span className="text-xs text-slate-500">Score: {score}/100</span>
              </div>
            </div>

            {/* Personal & Employment Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-slate-700">{selected.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-slate-700">{selected.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Employer</p>
                <p className="text-slate-700">{selected.employer || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Income</p>
                <p className="text-slate-700">
                  {selected.income ? `$${selected.income.toLocaleString()}/yr` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Desired Unit</p>
                <p className="text-slate-700">{selected.desiredUnit || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Move-in Date</p>
                <p className="text-slate-700">{selected.moveInDate || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Current Address</p>
                <p className="text-slate-700">{selected.currentAddress || "—"}</p>
              </div>
              {selected.message && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Message</p>
                  <p className="text-slate-700">{selected.message}</p>
                </div>
              )}
            </div>

            {/* Background Check Section */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-900">Automated Background Check</h4>
                {screeningBadge(selected.screeningStatus)}
              </div>

              {selected.consentGiven ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Consent given by applicant
                </p>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> No consent provided
                </p>
              )}

              {selected.screeningStatus === "completed" && selected.screeningResult ? (
                <div className="space-y-3">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                      selected.screeningResult === "pass"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {selected.screeningResult === "pass" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {selected.screeningResult === "pass" ? "Passed" : "Review Needed"}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-xs text-slate-500">Credit Score</p>
                      </div>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          selected.creditScore && selected.creditScore >= 700
                            ? "text-green-600"
                            : selected.creditScore && selected.creditScore >= 620
                              ? "text-yellow-600"
                              : "text-red-600"
                        )}
                      >
                        {selected.creditScore || "—"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-xs text-slate-500">Identity</p>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          selected.identityVerified ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {selected.identityVerified ? "Verified" : "Not Verified"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-xs text-slate-500">Criminal</p>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          selected.criminalClear ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {selected.criminalClear ? "Clear" : "Records Found"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-xs text-slate-500">Eviction</p>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          selected.evictionClear ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {selected.evictionClear ? "Clear" : "Records Found"}
                      </p>
                    </div>
                  </div>

                  {selected.screeningDate && (
                    <p className="text-xs text-slate-400">
                      Screened on {new Date(selected.screeningDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : selected.consentGiven ? (
                <button
                  onClick={() => runScreening(selected.id)}
                  disabled={screening}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {screening ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {screening ? "Running Check..." : "Run Background Check"}
                </button>
              ) : (
                <p className="text-xs text-slate-400">
                  Cannot run screening without applicant consent.
                </p>
              )}
            </div>

            {/* Manual Verification Checklist */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-slate-900">Manual Verification</h4>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">Income verified (3x rent rule)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!selected.incomeVerified}
                    onChange={(e) => toggleCheck(selected.id, "incomeVerified", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">Employment verified</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!selected.employmentVerified}
                    onChange={(e) => toggleCheck(selected.id, "employmentVerified", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">Previous landlord reference checked</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!selected.landlordRefVerified}
                    onChange={(e) => toggleCheck(selected.id, "landlordRefVerified", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Landlord reference notes</label>
                <textarea
                  defaultValue={selected.landlordReference || ""}
                  onBlur={(e) => saveLandlordRef(selected.id, e.target.value)}
                  rows={2}
                  placeholder="Name, phone, length of tenancy, payment history..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Screening notes</label>
                <textarea
                  defaultValue={selected.screeningNotes || ""}
                  onBlur={(e) => saveScreeningNotes(selected.id, e.target.value)}
                  rows={2}
                  placeholder="Any concerns or observations..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none resize-none"
                />
              </div>
            </div>

            {/* Review Actions */}
            {selected.status === "pending" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Decision Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(selected.id, "approved")}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "rejected")}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </>
            )}

            {/* Convert to Tenant */}
            {selected.status === "approved" && !selected.convertedToTenantId && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-slate-900">Convert to Tenant</h4>
                </div>
                {!showConvert ? (
                  <button
                    onClick={() => {
                      setShowConvert(true);
                      if (selected.desiredUnit) setConvertUnit(selected.desiredUnit);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Tenant Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Assign Unit</label>
                      <select
                        value={convertUnit}
                        onChange={(e) => {
                          setConvertUnit(e.target.value);
                          const u = units.find((x) => x.number === e.target.value);
                          if (u) setConvertRent(String(u.rent));
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                      >
                        <option value="">— Select a unit —</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.number}>
                            Unit {u.number} — ${u.rent}/mo
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Rent</label>
                        <input
                          type="number"
                          value={convertRent}
                          onChange={(e) => setConvertRent(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Lease Start</label>
                        <input
                          type="date"
                          value={convertLeaseStart}
                          onChange={(e) => setConvertLeaseStart(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Lease End</label>
                        <input
                          type="date"
                          value={convertLeaseEnd}
                          onChange={(e) => setConvertLeaseEnd(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={convertToTenant}
                        disabled={converting}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {converting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        {converting ? "Creating..." : "Create & Send Invite"}
                      </button>
                      <button
                        onClick={() => setShowConvert(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selected.convertedToTenantId && (
              <div className="border border-green-200 bg-green-50 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700">
                  Converted to tenant account · invite email sent
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setSelected(null);
                setShowConvert(false);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
