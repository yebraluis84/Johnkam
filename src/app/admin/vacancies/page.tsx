"use client";

import {
  Home,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Calendar,
  CheckCircle2,
  Wrench,
  Clock,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";
import { vacantUnits } from "@/lib/extended-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function VacanciesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = vacantUnits.filter(
    (u) =>
      u.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    available: { label: "Available Now", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
    reserved: { label: "Reserved", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-4 h-4 text-blue-500" /> },
    maintenance: { label: "Under Maintenance", color: "bg-orange-100 text-orange-700", icon: <Wrench className="w-4 h-4 text-orange-500" /> },
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vacant Units</h1>
            <p className="text-slate-500 mt-0.5">
              {vacantUnits.length} units available &middot;{" "}
              {vacantUnits.filter((u) => u.status === "available").length} ready for move-in
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
          <Plus className="w-4 h-4" />
          List New Unit
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Available", count: vacantUnits.filter((u) => u.status === "available").length, color: "text-green-600 bg-green-50" },
          { label: "Reserved", count: vacantUnits.filter((u) => u.status === "reserved").length, color: "text-blue-600 bg-blue-50" },
          { label: "In Maintenance", count: vacantUnits.filter((u) => u.status === "maintenance").length, color: "text-orange-600 bg-orange-50" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-lg p-4 text-center", stat.color)}>
            <p className="text-3xl font-bold">{stat.count}</p>
            <p className="text-xs font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by unit or features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      {/* Unit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((unit) => {
          const status = statusConfig[unit.status];
          return (
            <div
              key={unit.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition"
            >
              {/* Header with unit image placeholder */}
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-36 flex items-center justify-center relative">
                <Home className="w-12 h-12 text-slate-300" />
                <span className={cn("absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
                  {status.icon}
                  {status.label}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900">Unit {unit.unit}</h3>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(unit.rent)}<span className="text-xs font-normal text-slate-400">/mo</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {unit.bedrooms} bed
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {unit.bathrooms} bath
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    {unit.sqft} sqft
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  Available: {formatDate(unit.availableDate)}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {unit.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {unit.lastTenant && (
                  <p className="text-xs text-slate-400 mb-3">
                    Previous: {unit.lastTenant} (moved out {formatDate(unit.lastMoveOut!)})
                  </p>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition">
                    Assign Tenant
                  </button>
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    Edit Listing
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
