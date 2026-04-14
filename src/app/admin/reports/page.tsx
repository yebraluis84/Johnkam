"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Users,
  Home,
  Wrench,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { cn } from "@/lib/utils";

type ReportTab = "overview" | "rent-roll" | "income" | "expenses";

interface RentRollEntry {
  tenantName: string;
  email: string;
  unit: string;
  rentAmount: number;
  balance: number;
  leaseStart: string;
  leaseEnd: string;
  status: string;
}

interface IncomeEntry {
  date: string;
  tenantName: string;
  unit: string;
  amount: number;
  method: string;
  confirmation: string;
}

interface ExpenseEntry {
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor: string;
}

export default function ReportsPage() {
  const { tenants, tickets, vacancies, property } = useAppState();
  const [tab, setTab] = useState<ReportTab>("overview");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netIncome: 0, activeTenants: 0, occupancyRate: 0, occupiedUnits: 0, totalUnits: 0, openTickets: 0 });
  const [rentRoll, setRentRoll] = useState<RentRollEntry[]>([]);
  const [rentRollTotals, setRentRollTotals] = useState({ totalRent: 0, totalBalance: 0 });
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [expenseData, setExpenseData] = useState<ExpenseEntry[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [byCategory, setByCategory] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/reports?type=summary").then((r) => r.ok ? r.json() : null).then((d) => d && setSummary(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "rent-roll") {
      fetch("/api/reports?type=rent-roll").then((r) => r.ok ? r.json() : null).then((d) => {
        if (d) { setRentRoll(d.rentRoll); setRentRollTotals({ totalRent: d.totalRent, totalBalance: d.totalBalance }); }
      }).catch(() => {});
    }
    if (tab === "income") {
      fetch(`/api/reports?type=income&from=${dateFrom}&to=${dateTo}`).then((r) => r.ok ? r.json() : null).then((d) => {
        if (d) { setIncome(d.income); setTotalIncome(d.totalIncome); }
      }).catch(() => {});
    }
    if (tab === "expenses") {
      fetch(`/api/reports?type=expenses&from=${dateFrom}&to=${dateTo}`).then((r) => r.ok ? r.json() : null).then((d) => {
        if (d) { setExpenseData(d.expenses); setTotalExpenses(d.totalExpenses); setByCategory(d.byCategory || {}); }
      }).catch(() => {});
    }
  }, [tab, dateFrom, dateTo]);

  function downloadCSV(filename: string, headers: string[], rows: string[][]) {
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportRentRoll() {
    downloadCSV("rent-roll.csv", ["Tenant", "Email", "Unit", "Rent", "Balance", "Lease Start", "Lease End", "Status"],
      rentRoll.map((r) => [r.tenantName, r.email, r.unit, r.rentAmount.toFixed(2), r.balance.toFixed(2), r.leaseStart?.split("T")[0] || "", r.leaseEnd?.split("T")[0] || "", r.status])
    );
  }

  function exportIncome() {
    downloadCSV("income-report.csv", ["Date", "Tenant", "Unit", "Amount", "Method", "Confirmation"],
      income.map((i) => [i.date.split("T")[0], i.tenantName, i.unit, i.amount.toFixed(2), i.method, i.confirmation || ""])
    );
  }

  function exportExpenses() {
    downloadCSV("expense-report.csv", ["Date", "Category", "Description", "Amount", "Vendor"],
      expenseData.map((e) => [e.date.split("T")[0], e.category, e.description, e.amount.toFixed(2), e.vendor || ""])
    );
  }

  const activeCount = tenants.filter((t) => t.status === "active").length;
  const openTickets = tickets.filter((t) => t.status !== "completed" && t.status !== "closed").length;
  const occupancyRate = property.totalUnits > 0 ? Math.round((property.occupiedUnits / property.totalUnits) * 100) : 0;

  const tabs: { id: ReportTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "rent-roll", label: "Rent Roll" },
    { id: "income", label: "Income" },
    { id: "expenses", label: "Expenses" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-slate-500 mt-0.5">Income, expenses & property analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors", tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Date Range (for income/expenses) */}
      {(tab === "income" || tab === "expenses") && (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">From</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm" />
          <span className="text-sm text-slate-600">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm" />
        </div>
      )}

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Total Income</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">${summary.totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Total Expenses</p>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1">${summary.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Net Income</p>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <p className={cn("text-2xl font-bold mt-1", summary.netIncome >= 0 ? "text-green-600" : "text-red-600")}>${summary.netIncome.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Occupancy</p>
                <Home className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">{occupancyRate}%</p>
              <p className="text-xs text-slate-400">{property.occupiedUnits}/{property.totalUnits} units</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Property Stats</h2>
              <div className="space-y-3">
                {[
                  { label: "Active Tenants", value: activeCount, icon: Users, color: "text-blue-600" },
                  { label: "Open Tickets", value: openTickets, icon: Wrench, color: "text-orange-600" },
                  { label: "Available Units", value: vacancies.filter((v) => v.status === "available").length, icon: Home, color: "text-green-600" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4", item.color)} />
                      <span className="text-sm text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Occupancy Breakdown</h2>
              <div className="w-full bg-slate-100 rounded-full h-6 mb-4">
                <div className="h-6 rounded-full bg-emerald-500 transition-all flex items-center justify-center text-xs text-white font-medium" style={{ width: `${Math.max(occupancyRate, 10)}%` }}>
                  {occupancyRate}%
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{vacancies.filter((v) => v.status === "available").length}</p>
                  <p className="text-xs text-green-700">Available</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{property.occupiedUnits}</p>
                  <p className="text-xs text-blue-700">Occupied</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-lg font-bold text-orange-600">{vacancies.filter((v) => v.status === "maintenance").length}</p>
                  <p className="text-xs text-orange-700">Maintenance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rent Roll */}
      {tab === "rent-roll" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-sm">
              <span className="text-slate-600">Monthly Rent: <strong className="text-green-600">${rentRollTotals.totalRent.toFixed(2)}</strong></span>
              <span className="text-slate-600">Outstanding: <strong className="text-red-600">${rentRollTotals.totalBalance.toFixed(2)}</strong></span>
            </div>
            <button onClick={exportRentRoll} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Tenant</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Unit</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Rent</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Balance</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Lease End</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentRoll.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No active tenants</td></tr>
                ) : rentRoll.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{r.tenantName}</p>
                      <p className="text-xs text-slate-400">{r.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{r.unit}</td>
                    <td className="px-5 py-3 text-sm text-right font-medium text-slate-900">${r.rentAmount.toFixed(2)}</td>
                    <td className={cn("px-5 py-3 text-sm text-right font-medium", r.balance > 0 ? "text-red-600" : "text-green-600")}>${r.balance.toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{r.leaseEnd ? new Date(r.leaseEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Income */}
      {tab === "income" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Total: <strong className="text-green-600">${totalIncome.toFixed(2)}</strong> ({income.length} payments)</span>
            <button onClick={exportIncome} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Tenant</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Unit</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Method</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {income.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No payments in this period</td></tr>
                ) : income.map((i, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm text-slate-600">{new Date(i.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-900">{i.tenantName}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{i.unit}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{i.method}</span></td>
                    <td className="px-5 py-3 text-sm text-right font-semibold text-green-600">+${i.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses */}
      {tab === "expenses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Total: <strong className="text-red-600">${totalExpenses.toFixed(2)}</strong> ({expenseData.length} entries)</span>
            <button onClick={exportExpenses} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Category breakdown */}
          {Object.keys(byCategory).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">By Category</h3>
              <div className="space-y-2">
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-40 truncate">{cat}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-red-400" style={{ width: `${(amt / totalExpenses) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-slate-900 w-24 text-right">${amt.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Description</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Vendor</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenseData.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No expenses in this period</td></tr>
                ) : expenseData.map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm text-slate-600">{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{e.category}</span></td>
                    <td className="px-5 py-3 text-sm text-slate-900">{e.description}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{e.vendor || "—"}</td>
                    <td className="px-5 py-3 text-sm text-right font-semibold text-red-600">${e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
