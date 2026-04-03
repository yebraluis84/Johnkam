"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Wrench,
  Clock,
  Download,
  Calendar,
} from "lucide-react";
import { monthlyReports } from "@/lib/extended-data";
import { formatCurrency, cn } from "@/lib/utils";

export default function ReportsPage() {
  const [period, setPeriod] = useState("6months");

  const latest = monthlyReports[0];
  const previous = monthlyReports[1];

  function pctChange(current: number, prev: number): { value: string; positive: boolean } {
    const change = ((current - prev) / prev) * 100;
    return { value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`, positive: change >= 0 };
  }

  const revChange = pctChange(latest.collected, previous.collected);
  const expChange = pctChange(latest.expenses, previous.expenses);
  const netChange = pctChange(latest.netIncome, previous.netIncome);

  function monthLabel(m: string): string {
    const [year, month] = m.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }

  const maxRevenue = Math.max(...monthlyReports.map((r) => r.revenue));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Reports & Analytics
            </h1>
            <p className="text-slate-500 mt-0.5">
              Financial performance and property metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none"
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="year">This Year</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Revenue Collected</p>
            <div className={cn("flex items-center gap-1 text-xs font-medium", revChange.positive ? "text-green-600" : "text-red-600")}>
              {revChange.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {revChange.value}
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(latest.collected)}
          </p>
          <p className="text-xs text-slate-400 mt-1">vs {formatCurrency(previous.collected)} last month</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Expenses</p>
            <div className={cn("flex items-center gap-1 text-xs font-medium", !expChange.positive ? "text-green-600" : "text-red-600")}>
              {!expChange.positive ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {expChange.value}
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(latest.expenses)}
          </p>
          <p className="text-xs text-slate-400 mt-1">vs {formatCurrency(previous.expenses)} last month</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Net Income</p>
            <div className={cn("flex items-center gap-1 text-xs font-medium", netChange.positive ? "text-green-600" : "text-red-600")}>
              {netChange.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {netChange.value}
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(latest.netIncome)}
          </p>
          <p className="text-xs text-slate-400 mt-1">vs {formatCurrency(previous.netIncome)} last month</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Occupancy Rate</p>
            <Home className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {latest.occupancyRate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {Math.round(24 * latest.occupancyRate / 100)} of 24 units
          </p>
        </div>
      </div>

      {/* Revenue Chart (bar chart with CSS) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-slate-900">Revenue vs Expenses</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              Collected
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded" />
              Expenses
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-400 rounded" />
              Net Income
            </span>
          </div>
        </div>

        <div className="flex items-end gap-3 h-48">
          {[...monthlyReports].reverse().map((report) => (
            <div key={report.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: "160px" }}>
                <div
                  className="flex-1 bg-emerald-500 rounded-t transition-all"
                  style={{ height: `${(report.collected / maxRevenue) * 100}%` }}
                  title={`Collected: ${formatCurrency(report.collected)}`}
                />
                <div
                  className="flex-1 bg-red-400 rounded-t transition-all"
                  style={{ height: `${(report.expenses / maxRevenue) * 100}%` }}
                  title={`Expenses: ${formatCurrency(report.expenses)}`}
                />
                <div
                  className="flex-1 bg-blue-400 rounded-t transition-all"
                  style={{ height: `${(report.netIncome / maxRevenue) * 100}%` }}
                  title={`Net: ${formatCurrency(report.netIncome)}`}
                />
              </div>
              <span className="text-xs text-slate-400">{monthLabel(report.month)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Monthly Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Month</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Revenue</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Collected</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Expenses</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Net Income</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Occupancy</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Tickets</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Avg Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyReports.map((report) => (
                <tr key={report.month} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-900">{monthLabel(report.month)}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{formatCurrency(report.revenue)}</td>
                  <td className="px-5 py-3 text-right text-green-600 font-medium">{formatCurrency(report.collected)}</td>
                  <td className="px-5 py-3 text-right text-red-600">{formatCurrency(report.expenses)}</td>
                  <td className="px-5 py-3 text-right text-emerald-600 font-semibold">{formatCurrency(report.netIncome)}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{report.occupancyRate}%</td>
                  <td className="px-5 py-3 text-right text-slate-700">{report.maintenanceRequests}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{report.avgResponseTime}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Maintenance Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <Wrench className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {monthlyReports.reduce((s, r) => s + r.maintenanceRequests, 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total Requests (6mo)</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(monthlyReports.reduce((s, r) => s + r.avgResponseTime, 0) / monthlyReports.length)}h
            </p>
            <p className="text-xs text-slate-500 mt-1">Avg Response Time</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <TrendingDown className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {latest.avgResponseTime}h
            </p>
            <p className="text-xs text-slate-500 mt-1">Current Month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
