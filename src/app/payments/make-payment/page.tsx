"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Building,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { currentTenant } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";

type PaymentMethod = "credit_card" | "ach";

export default function MakePaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("credit_card");
  const [amount, setAmount] = useState(currentTenant.balance.toString());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  }

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payment Successful!
          </h1>
          <p className="text-slate-500">
            Your payment of{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(parseFloat(amount))}
            </span>{" "}
            has been processed successfully.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Confirmation #</span>
              <span className="font-mono text-slate-700">
                {method === "credit_card" ? "CC" : "ACH"}-
                {Math.floor(Math.random() * 90000 + 10000)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method</span>
              <span className="text-slate-700">
                {method === "credit_card" ? "Credit Card" : "ACH Transfer"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="text-slate-700">April 2, 2026</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/payments"
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              View Payment History
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link
        href="/payments"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Payments
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Make a Payment</h1>
        <p className="text-slate-500 mt-1">
          Pay your rent securely via credit card or bank transfer
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Payment Amount</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition">
              <input
                type="radio"
                name="amount_type"
                value="full"
                defaultChecked
                onChange={() => setAmount(currentTenant.balance.toString())}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-slate-700">
                  Full Balance Due
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(currentTenant.balance)}
                </span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition">
              <input
                type="radio"
                name="amount_type"
                value="custom"
                onChange={() => setAmount("")}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-slate-700">Custom Amount</span>
            </label>
            {amount !== currentTenant.balance.toString() && (
              <div className="relative ml-7">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMethod("credit_card")}
              className={cn(
                "flex items-center gap-3 p-4 border-2 rounded-lg transition text-left",
                method === "credit_card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  method === "credit_card"
                    ? "bg-blue-100"
                    : "bg-slate-100"
                )}
              >
                <CreditCard
                  className={cn(
                    "w-5 h-5",
                    method === "credit_card"
                      ? "text-blue-600"
                      : "text-slate-500"
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Credit / Debit Card
                </p>
                <p className="text-xs text-slate-500">
                  Visa, Mastercard, Amex
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("ach")}
              className={cn(
                "flex items-center gap-3 p-4 border-2 rounded-lg transition text-left",
                method === "ach"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  method === "ach" ? "bg-blue-100" : "bg-slate-100"
                )}
              >
                <Building
                  className={cn(
                    "w-5 h-5",
                    method === "ach" ? "text-blue-600" : "text-slate-500"
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Bank Account (ACH)
                </p>
                <p className="text-xs text-slate-500">No processing fee</p>
              </div>
            </button>
          </div>

          {/* Credit Card Fields */}
          {method === "credit_card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  defaultValue=""
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    CVV
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Billing Zip Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="12345"
                  maxLength={5}
                  className="w-48 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* ACH Fields */}
          {method === "ach" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  defaultValue=""
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Routing Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="9 digit routing number"
                  maxLength={9}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Account Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Account number"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Re-enter account number"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Account Type
                </label>
                <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white appearance-none">
                  <option>Checking</option>
                  <option>Savings</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Secure Payment
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              All payment information is encrypted with 256-bit SSL. We never
              store your full card or account details.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/payments"
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !amount}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Lock className="w-3 h-3" />
            {loading
              ? "Processing..."
              : `Pay ${amount ? formatCurrency(parseFloat(amount) || 0) : ""}`}
          </button>
        </div>
      </form>
    </div>
  );
}
