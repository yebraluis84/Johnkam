"use client";

import Link from "next/link";
import {
  CreditCard,
  Building,
  DollarSign,
  ArrowRight,
  Download,
  CheckCircle2,
} from "lucide-react";
import { currentTenant, payments } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

const methodLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  credit_card: {
    label: "Credit Card",
    icon: <CreditCard className="w-4 h-4 text-slate-500" />,
  },
  ach: {
    label: "ACH Transfer",
    icon: <Building className="w-4 h-4 text-slate-500" />,
  },
  check: {
    label: "Check",
    icon: <DollarSign className="w-4 h-4 text-slate-500" />,
  },
};

export default function PaymentsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 mt-1">
            Manage your rent payments and view history
          </p>
        </div>
        <Link
          href="/payments/make-payment"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <DollarSign className="w-4 h-4" />
          Make a Payment
        </Link>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm">Current Balance</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(currentTenant.balance)}
            </p>
            <p className="text-blue-200 text-sm mt-2">
              Due: April 1, 2026 &middot; Monthly Rent:{" "}
              {formatCurrency(currentTenant.rentAmount)}
            </p>
          </div>
          <Link
            href="/payments/make-payment"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
          >
            Pay Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Auto-Pay */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              Auto-Pay is Available
            </p>
            <p className="text-xs text-slate-500">
              Set up automatic monthly payments so you never miss a due date
            </p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
          Set Up Auto-Pay
        </button>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Payment History</h2>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">Method</div>
            <div className="col-span-2">Confirmation</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <div className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition"
              >
                <div className="col-span-2 text-sm text-slate-700">
                  {formatDate(payment.date)}
                </div>
                <div className="col-span-3 text-sm font-medium text-slate-900">
                  {payment.description}
                </div>
                <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
                  {methodLabels[payment.method]?.icon}
                  {methodLabels[payment.method]?.label}
                </div>
                <div className="col-span-2 text-sm text-slate-500 font-mono">
                  {payment.confirmationNumber || "—"}
                </div>
                <div className="col-span-1">
                  <StatusBadge status={payment.status} />
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {payments.map((payment) => (
            <div key={payment.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {payment.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(payment.date)} &middot;{" "}
                    {methodLabels[payment.method]?.label}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={payment.status} />
                <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
