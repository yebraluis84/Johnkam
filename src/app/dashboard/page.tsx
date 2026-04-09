"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  FileText,
  Megaphone,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  MessageSquare,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { StatusBadge } from "@/components/StatusBadge";

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: string;
  author: string;
  createdAt: string;
}

interface LeaseInfo {
  leaseEnd: string;
  leaseStart: string;
  unit: string;
  rentAmount: number;
}

interface RenewalOffer {
  id: string;
  status: string;
  proposedRent: number;
  newLeaseEnd: string;
}

export default function DashboardPage() {
  const { tickets: maintenanceTickets } = useAppState();
  const [userName, setUserName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [lease, setLease] = useState<LeaseInfo | null>(null);
  const [renewal, setRenewal] = useState<RenewalOffer | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const openTickets = maintenanceTickets.filter(
    (t) => t.status !== "completed" && t.status !== "closed"
  ).length;

  useEffect(() => {
    let userId = "";
    let tId = "";
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user.name?.split(" ")[0] || "");
      userId = user.id || "";
      tId = user.tenantId || "";
      setTenantId(tId);
    } catch {}

    // Fetch real data in parallel
    Promise.all([
      fetch("/api/announcements").then((r) => r.ok ? r.json() : []).catch(() => []),
      tId ? fetch(`/api/lease-renewals?tenantId=${tId}`).then((r) => r.ok ? r.json() : []).catch(() => []) : [],
      userId ? fetch(`/api/messages?userId=${userId}`).then((r) => r.ok ? r.json() : []).catch(() => []) : [],
      tId ? fetch(`/api/documents?tenantId=${tId}`).then((r) => r.ok ? r.json() : []).catch(() => []) : [],
      tId ? fetch(`/api/tenants`).then((r) => r.ok ? r.json() : []).catch(() => []) : [],
    ]).then(([anns, renewals, convos, docs, tenants]) => {
      setAnnouncements(Array.isArray(anns) ? anns : []);

      const activeRenewal = Array.isArray(renewals) ? renewals.find((r: RenewalOffer) => r.status === "offered") : null;
      setRenewal(activeRenewal || null);

      setMessageCount(Array.isArray(convos) ? convos.reduce((sum: number, c: { unread: number }) => sum + c.unread, 0) : 0);
      setDocCount(Array.isArray(docs) ? docs.filter((d: { status: string }) => d.status === "pending").length : 0);

      // Get lease info from tenant data
      if (tId && Array.isArray(tenants)) {
        const myTenant = tenants.find((t: { id: string }) => t.id === tId);
        if (myTenant) {
          setLease({
            leaseEnd: myTenant.leaseEnd,
            leaseStart: myTenant.leaseStart,
            unit: myTenant.unit,
            rentAmount: myTenant.rentAmount,
          });
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  const daysUntilExpiry = lease?.leaseEnd
    ? Math.ceil((new Date(lease.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your account
        </p>
      </div>

      {/* Renewal Banner */}
      {renewal && (
        <Link
          href="/lease-renewal"
          className="block bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white hover:from-blue-700 hover:to-blue-800 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-200" />
              <div>
                <p className="font-semibold">Lease Renewal Offer Available</p>
                <p className="text-sm text-blue-200 mt-0.5">
                  New rate: ${renewal.proposedRent}/mo through {new Date(renewal.newLeaseEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-200" />
          </div>
        </Link>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open Requests</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{openTickets}</p>
            </div>
            <div className="w-11 h-11 bg-orange-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Lease Expires</p>
              {daysUntilExpiry !== null ? (
                <p className={`text-2xl font-bold mt-1 ${daysUntilExpiry < 60 ? "text-red-600" : daysUntilExpiry < 120 ? "text-yellow-600" : "text-slate-900"}`}>
                  {daysUntilExpiry}d
                </p>
              ) : (
                <p className="text-2xl font-bold text-slate-900 mt-1">--</p>
              )}
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Unread Messages</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{messageCount}</p>
            </div>
            <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Docs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{docCount}</p>
            </div>
            <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/maintenance/new" className="bg-blue-600 text-white rounded-xl p-5 hover:bg-blue-700 transition">
          <Wrench className="w-8 h-8 mb-3" />
          <p className="font-semibold">New Request</p>
          <p className="text-sm text-blue-200 mt-1">Submit maintenance ticket</p>
        </Link>
        <Link href="/documents" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition">
          <FileText className="w-8 h-8 mb-3 text-slate-600" />
          <p className="font-semibold text-slate-900">Documents</p>
          <p className="text-sm text-slate-500 mt-1">View lease & files</p>
        </Link>
        <Link href="/announcements" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition">
          <Megaphone className="w-8 h-8 mb-3 text-slate-600" />
          <p className="font-semibold text-slate-900">Announcements</p>
          <p className="text-sm text-slate-500 mt-1">{announcements.length} updates</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Maintenance Requests</h2>
            <Link href="/maintenance" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {maintenanceTickets.slice(0, 3).map((ticket) => (
              <Link key={ticket.id} href={`/maintenance/${ticket.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {ticket.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : ticket.priority === "high" || ticket.priority === "urgent" ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{ticket.title}</p>
                    <p className="text-xs text-slate-400">{ticket.id} &middot; {ticket.category}</p>
                  </div>
                </div>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
            {maintenanceTickets.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">No maintenance requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Announcements</h2>
            <Link href="/announcements" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {ann.priority === "urgent" && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                      {ann.priority === "important" && <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />}
                      <p className="text-sm font-medium text-slate-900 truncate">{ann.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ann.message}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">No announcements</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
