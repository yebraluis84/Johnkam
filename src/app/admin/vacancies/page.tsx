"use client";

import {
  Home,
  Bed,
  Bath,
  Maximize,
  Calendar,
  CheckCircle2,
  Wrench,
  Clock,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/app-context";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function VacanciesPage() {
  const { vacancies: vacantUnits, addVacancy, removeVacancy } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

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

  function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const unit = (form.elements.namedItem("unit") as HTMLInputElement).value;
    const floor = parseInt((form.elements.namedItem("floor") as HTMLInputElement).value);
    const bedrooms = parseInt((form.elements.namedItem("bedrooms") as HTMLSelectElement).value);
    const bathrooms = parseInt((form.elements.namedItem("bathrooms") as HTMLSelectElement).value);
    const sqft = parseInt((form.elements.namedItem("sqft") as HTMLInputElement).value);
    const rent = parseFloat((form.elements.namedItem("rent") as HTMLInputElement).value);
    const availableDate = (form.elements.namedItem("availableDate") as HTMLInputElement).value;
    const status = (form.elements.namedItem("status") as HTMLSelectElement).value as "available" | "reserved" | "maintenance";
    const featuresStr = (form.elements.namedItem("features") as HTMLInputElement).value;
    const features = featuresStr.split(",").map((f) => f.trim()).filter(Boolean);

    addVacancy({
      id: `vu-${Date.now()}`,
      unit,
      floor,
      bedrooms,
      bathrooms,
      sqft,
      rent,
      availableDate,
      status,
      features,
    });

    setShowAddForm(false);
    form.reset();
  }

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
              {vacantUnits.length} units &middot;{" "}
              {vacantUnits.filter((u) => u.status === "available").length} ready for move-in
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </button>
      </div>

      {/* Add Unit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Add New Vacant Unit</h2>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddUnit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-1.5">Unit # *</label>
                <input id="unit" name="unit" type="text" required placeholder="e.g. 5A" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-slate-700 mb-1.5">Floor *</label>
                <input id="floor" name="floor" type="number" required min="1" placeholder="1" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-slate-700 mb-1.5">Bedrooms *</label>
                <select id="bedrooms" name="bedrooms" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
                  <option value="0">Studio</option>
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-slate-700 mb-1.5">Bathrooms *</label>
                <select id="bathrooms" name="bathrooms" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
                  <option value="1" selected>1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-slate-700 mb-1.5">Sq Ft *</label>
                <input id="sqft" name="sqft" type="number" required min="100" placeholder="850" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label htmlFor="rent" className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Rent *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input id="rent" name="rent" type="number" step="0.01" required min="1" placeholder="1850" className="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">Status *</label>
                <select id="status" name="status" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
                  <option value="available">Available</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="availableDate" className="block text-sm font-medium text-slate-700 mb-1.5">Available Date *</label>
                <input id="availableDate" name="availableDate" type="date" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label htmlFor="features" className="block text-sm font-medium text-slate-700 mb-1.5">Features (comma-separated)</label>
                <input id="features" name="features" type="text" placeholder="Balcony, Hardwood Floors, Walk-In Closet" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Unit
              </button>
            </div>
          </form>
        </div>
      )}

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
        <input type="text" placeholder="Search by unit or features..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
      </div>

      {/* Unit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((unit) => {
          const status = statusConfig[unit.status];
          return (
            <div key={unit.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition">
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
                  <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{unit.bedrooms} bed</span>
                  <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{unit.bathrooms} bath</span>
                  <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{unit.sqft} sqft</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  Available: {formatDate(unit.availableDate)}
                </div>
                {unit.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {unit.features.map((feature) => (
                      <span key={feature} className="inline-flex px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{feature}</span>
                    ))}
                  </div>
                )}
                {unit.lastTenant && (
                  <p className="text-xs text-slate-400 mb-3">Previous: {unit.lastTenant} (moved out {formatDate(unit.lastMoveOut!)})</p>
                )}
                <div className="flex gap-2">
                  <Link href={`/admin/tenants/new?unit=${encodeURIComponent(unit.unit)}&rent=${unit.rent}`} className="flex-1 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition text-center">Assign Tenant</Link>
                  <button onClick={() => removeVacancy(unit.id)} className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">Remove</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Home className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No vacant units found</p>
          <button onClick={() => setShowAddForm(true)} className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            + Add your first unit
          </button>
        </div>
      )}
    </div>
  );
}
