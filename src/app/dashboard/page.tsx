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
} from "lucide-react";
import { announcements } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const { tickets: maintenanceTickets } = useAppState();
  const [userName, setUserName] = useState("");
  const openTickets = maintenanceTickets.filter(
    (t) => t.status !== "completed" && t.status !== "closed"
  ).length;

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user.name?.split(" ")[0] || "");
    } catch {}
  }, []);

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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open Requests</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {openTickets}
              </p>
            </div>
            <div className="w-11 h-11 bg-orange-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {maintenanceTickets.filter((t) => t.status === "scheduled").length}{" "}
            scheduled
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Lease Expires</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                Jul 31
              </p>
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">121 days remaining</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Messages</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
            </div>
            <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Conversations</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/maintenance/new"
          className="bg-blue-600 text-white rounded-xl p-5 hover:bg-blue-700 transition group"
        >
          <Wrench className="w-8 h-8 mb-3" />
          <p className="font-semibold">New Request</p>
          <p className="text-sm text-blue-200 mt-1">
            Submit maintenance ticket
          </p>
        </Link>

        <Link
          href="/documents"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition group"
        >
          <FileText className="w-8 h-8 mb-3 text-slate-600" />
          <p className="font-semibold text-slate-900">Documents</p>
          <p className="text-sm text-slate-500 mt-1">View lease & files</p>
        </Link>

        <Link
          href="/announcements"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition group"
        >
          <Megaphone className="w-8 h-8 mb-3 text-slate-600" />
          <p className="font-semibold text-slate-900">Announcements</p>
          <p className="text-sm text-slate-500 mt-1">
            {announcements.length} new updates
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">
              Maintenance Requests
            </h2>
            <Link
              href="/maintenance"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {maintenanceTickets.slice(0, 3).map((ticket) => (
              <Link
                key={ticket.id}
                href={`/maintenance/${ticket.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {ticket.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : ticket.priority === "high" ||
                      ticket.priority === "urgent" ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {ticket.id} &middot; {ticket.category}
                    </p>
                  </div>
                </div>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Announcements</h2>
            <Link
              href="/announcements"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {ann.priority === "urgent" && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      )}
                      {ann.priority === "important" && (
                        <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {ann.title}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {ann.message}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {formatDate(ann.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
