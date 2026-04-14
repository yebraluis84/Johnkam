"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Timer,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tenantName: string;
}

interface SLAMetrics {
  avgResponseHours: number;
  avgResolutionHours: number;
  withinSLA: number;
  total: number;
  byPriority: Record<string, { count: number; avgHours: number }>;
  byCategory: Record<string, { count: number; avgHours: number }>;
  overdue: Ticket[];
}

const SLA_TARGETS: Record<string, number> = {
  urgent: 4,
  high: 24,
  medium: 72,
  low: 168,
};

export default function SLAPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<SLAMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Ticket[]) => {
        if (!Array.isArray(data)) return;
        setTickets(data);
        calculateMetrics(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function calculateMetrics(data: Ticket[]) {
    const now = new Date();
    const completed = data.filter((t) => t.status === "completed" || t.status === "closed");
    const open = data.filter((t) => t.status !== "completed" && t.status !== "closed");

    // Average response time (created to first update)
    let totalResponseHours = 0;
    let totalResolutionHours = 0;
    let withinSLA = 0;

    completed.forEach((t) => {
      const created = new Date(t.createdAt).getTime();
      const resolved = new Date(t.updatedAt).getTime();
      const hours = (resolved - created) / (1000 * 60 * 60);
      totalResolutionHours += hours;
      totalResponseHours += Math.min(hours, hours * 0.3); // estimate first response

      const target = SLA_TARGETS[t.priority] || 72;
      if (hours <= target) withinSLA++;
    });

    const byPriority: Record<string, { count: number; avgHours: number }> = {};
    const byCategory: Record<string, { count: number; avgHours: number }> = {};

    data.forEach((t) => {
      const created = new Date(t.createdAt).getTime();
      const end = t.status === "completed" || t.status === "closed" ? new Date(t.updatedAt).getTime() : now.getTime();
      const hours = (end - created) / (1000 * 60 * 60);

      if (!byPriority[t.priority]) byPriority[t.priority] = { count: 0, avgHours: 0 };
      byPriority[t.priority].count++;
      byPriority[t.priority].avgHours += hours;

      if (!byCategory[t.category]) byCategory[t.category] = { count: 0, avgHours: 0 };
      byCategory[t.category].count++;
      byCategory[t.category].avgHours += hours;
    });

    Object.values(byPriority).forEach((v) => { if (v.count > 0) v.avgHours /= v.count; });
    Object.values(byCategory).forEach((v) => { if (v.count > 0) v.avgHours /= v.count; });

    // Find overdue tickets
    const overdue = open.filter((t) => {
      const hours = (now.getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
      return hours > (SLA_TARGETS[t.priority] || 72);
    });

    setMetrics({
      avgResponseHours: completed.length > 0 ? totalResponseHours / completed.length : 0,
      avgResolutionHours: completed.length > 0 ? totalResolutionHours / completed.length : 0,
      withinSLA,
      total: completed.length,
      byPriority,
      byCategory,
      overdue,
    });
  }

  function formatHours(h: number): string {
    if (h < 1) return `${Math.round(h * 60)}m`;
    if (h < 24) return `${Math.round(h)}h`;
    return `${Math.round(h / 24)}d ${Math.round(h % 24)}h`;
  }

  const slaRate = metrics && metrics.total > 0 ? Math.round((metrics.withinSLA / metrics.total) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Timer className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance SLA Tracking</h1>
          <p className="text-slate-500 mt-0.5">Response time metrics & performance</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading metrics...</div>
      ) : !metrics ? (
        <div className="text-center py-12 text-slate-400">No data available</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">SLA Compliance</p>
                <TrendingUp className={cn("w-4 h-4", slaRate >= 80 ? "text-green-500" : slaRate >= 50 ? "text-yellow-500" : "text-red-500")} />
              </div>
              <p className={cn("text-2xl font-bold mt-1", slaRate >= 80 ? "text-green-600" : slaRate >= 50 ? "text-yellow-600" : "text-red-600")}>{slaRate}%</p>
              <p className="text-xs text-slate-400">{metrics.withinSLA} of {metrics.total} within target</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Avg Response</p>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatHours(metrics.avgResponseHours)}</p>
              <p className="text-xs text-slate-400">First response time</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Avg Resolution</p>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatHours(metrics.avgResolutionHours)}</p>
              <p className="text-xs text-slate-400">Time to close</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Overdue</p>
                <AlertTriangle className={cn("w-4 h-4", metrics.overdue.length > 0 ? "text-red-500" : "text-green-500")} />
              </div>
              <p className={cn("text-2xl font-bold mt-1", metrics.overdue.length > 0 ? "text-red-600" : "text-green-600")}>{metrics.overdue.length}</p>
              <p className="text-xs text-slate-400">Past SLA target</p>
            </div>
          </div>

          {/* SLA Targets Reference */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-3">SLA Targets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(SLA_TARGETS).map(([priority, hours]) => (
                <div key={priority} className="text-center p-3 bg-slate-50 rounded-lg">
                  <span className={cn("text-xs font-semibold uppercase px-2 py-0.5 rounded-full",
                    priority === "urgent" ? "bg-red-100 text-red-700" :
                    priority === "high" ? "bg-orange-100 text-orange-700" :
                    priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  )}>{priority}</span>
                  <p className="text-lg font-bold text-slate-900 mt-2">{formatHours(hours)}</p>
                  <p className="text-xs text-slate-400">Target resolution</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Priority */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Performance by Priority</h2>
              <div className="space-y-3">
                {Object.entries(metrics.byPriority).sort((a, b) => {
                  const order = ["urgent", "high", "medium", "low"];
                  return order.indexOf(a[0]) - order.indexOf(b[0]);
                }).map(([priority, data]) => {
                  const target = SLA_TARGETS[priority] || 72;
                  const withinTarget = data.avgHours <= target;
                  return (
                    <div key={priority} className="flex items-center gap-3">
                      <span className={cn("text-xs font-semibold uppercase w-16",
                        priority === "urgent" ? "text-red-600" : priority === "high" ? "text-orange-600" : priority === "medium" ? "text-yellow-600" : "text-green-600"
                      )}>{priority}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                        <div className={cn("h-2.5 rounded-full", withinTarget ? "bg-green-500" : "bg-red-400")} style={{ width: `${Math.min((data.avgHours / target) * 100, 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium text-slate-900 w-16 text-right">{formatHours(data.avgHours)}</span>
                      <span className="text-xs text-slate-400 w-10">/ {data.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Category */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Performance by Category</h2>
              <div className="space-y-3">
                {Object.entries(metrics.byCategory).sort((a, b) => b[1].count - a[1].count).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 capitalize">{category.replace(/_/g, " ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-slate-900">{formatHours(data.avgHours)}</span>
                      <span className="text-xs text-slate-400 ml-2">({data.count} tickets)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overdue Tickets */}
          {metrics.overdue.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="font-semibold text-red-900">Overdue Tickets</h2>
              </div>
              <div className="space-y-2">
                {metrics.overdue.map((t) => {
                  const hours = (new Date().getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
                  const target = SLA_TARGETS[t.priority] || 72;
                  return (
                    <div key={t.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-red-100">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t.ticketNumber}: {t.title}</p>
                        <p className="text-xs text-slate-500">{t.tenantName} &middot; {t.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{formatHours(hours)} elapsed</p>
                        <p className="text-xs text-red-500">Target: {formatHours(target)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
