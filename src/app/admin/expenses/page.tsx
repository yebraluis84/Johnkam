"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  X,
  Trash2,
  Receipt,
  Search,
  Filter,
} from "lucide-react";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  vendor: string | null;
  date: string;
  recurring: boolean;
  notes: string | null;
  createdAt: string;
}

const CATEGORIES = [
  "Repairs & Maintenance",
  "Utilities",
  "Insurance",
  "Property Tax",
  "Management Fees",
  "Landscaping",
  "Cleaning",
  "Supplies",
  "Legal & Professional",
  "Marketing",
  "Other",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    description: "",
    amount: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    recurring: false,
    notes: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) setExpenses(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ category: CATEGORIES[0], description: "", amount: "", vendor: "", date: new Date().toISOString().split("T")[0], recurring: false, notes: "" });
      fetchExpenses();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    fetchExpenses();
  }

  const filtered = expenses.filter((e) => {
    if (filterCat && e.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.description.toLowerCase().includes(q) || (e.vendor || "").toLowerCase().includes(q);
    }
    return true;
  });

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const thisMonth = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expense Tracking</h1>
            <p className="text-slate-500 mt-0.5">Track property expenses & costs</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Expenses</p>
          <p className="text-2xl font-bold text-slate-900">${totalAll.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">This Month</p>
          <p className="text-2xl font-bold text-red-600">${thisMonth.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Entries</p>
          <p className="text-2xl font-bold text-slate-900">{expenses.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm appearance-none bg-white">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex justify-between text-sm text-slate-600">
            <span>{filtered.length} expense{filtered.length !== 1 ? "s" : ""}</span>
            <span className="font-semibold">Total: ${totalFiltered.toFixed(2)}</span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Category</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Description</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Vendor</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Amount</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No expenses found</td></tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm text-slate-900">{new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{exp.category}</span></td>
                    <td className="px-5 py-3 text-sm text-slate-900">{exp.description}{exp.recurring && <span className="ml-2 text-xs text-blue-600">(recurring)</span>}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{exp.vendor || "—"}</td>
                    <td className="px-5 py-3 text-sm text-right font-semibold text-red-600">${exp.amount.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(exp.id)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add Expense</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required placeholder="What was this expense for?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                  <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                  <input type="text" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={2} placeholder="Optional notes" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} className="rounded" />
                Recurring expense
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
