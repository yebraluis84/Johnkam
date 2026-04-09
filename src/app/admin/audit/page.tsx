"use client";

import { useState, useEffect } from "react";
import { Shield, Search, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  userName: string | null;
  details: string | null;
  createdAt: string;
}

const entityColors: Record<string, string> = {
  ticket: "bg-orange-100 text-orange-700",
  document: "bg-purple-100 text-purple-700",
  lease_renewal: "bg-blue-100 text-blue-700",
  checklist: "bg-green-100 text-green-700",
  user: "bg-slate-100 text-slate-700",
  login: "bg-cyan-100 text-cyan-700",
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("limit", "200");
    if (entityFilter) params.set("entity", entityFilter);

    fetch(`/api/audit?${params}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [entityFilter]);

  const entities = [...new Set(logs.map((l) => l.entity))];

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.userName?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-slate-500 mt-0.5">Track all system activity and changes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setLoading(true); }}
            className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm outline-none appearance-none bg-white"
          >
            <option value="">All Entities</option>
            {entities.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total Events</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Today</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {logs.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Unique Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {new Set(logs.filter((l) => l.userName).map((l) => l.userName)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Entity Types</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{entities.length}</p>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Timestamp</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Action</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Entity</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">User</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-slate-900">{log.action}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                      entityColors[log.entity] || "bg-slate-100 text-slate-700"
                    )}>
                      {log.entity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{log.userName || "System"}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{log.details || "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    No audit log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
