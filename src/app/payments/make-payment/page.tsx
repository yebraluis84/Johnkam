"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  Copy,
  Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BankInfo {
  bankName: string;
  bankAccountHolder: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountType: string;
  zelleEmail: string;
  paymentInstructions: string;
}

export default function MakePaymentPage() {
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [copied, setCopied] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch("/api/property")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setBankInfo({
            bankName: data.bankName || "",
            bankAccountHolder: data.bankAccountHolder || "",
            bankRoutingNumber: data.bankRoutingNumber || "",
            bankAccountNumber: data.bankAccountNumber || "",
            bankAccountType: data.bankAccountType || "checking",
            zelleEmail: data.zelleEmail || "",
            paymentInstructions: data.paymentInstructions || "",
          });
        }
      })
      .catch(() => {});

    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      if (stored.balance) setBalance(parseFloat(stored.balance));
    } catch {}
  }, []);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
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
          Send your rent via bank transfer or Zelle
        </p>
      </div>

      {/* Balance Due */}
      {balance > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Balance Due</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer / Zelle Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Landmark className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-slate-900">
            Bank Transfer / Zelle
          </h2>
        </div>

        {bankInfo && (bankInfo.bankName || bankInfo.zelleEmail) ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                Send payment to:
              </h3>
              {bankInfo.bankName && (
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs text-blue-600">Bank</p>
                    <p className="text-sm font-medium text-blue-900">
                      {bankInfo.bankName}
                    </p>
                  </div>
                  {bankInfo.bankAccountHolder && (
                    <div>
                      <p className="text-xs text-blue-600">Account Holder</p>
                      <p className="text-sm font-medium text-blue-900">
                        {bankInfo.bankAccountHolder}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {bankInfo.bankRoutingNumber && (
                      <div>
                        <p className="text-xs text-blue-600">Routing Number</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono font-medium text-blue-900">
                            {bankInfo.bankRoutingNumber}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                bankInfo.bankRoutingNumber,
                                "routing"
                              )
                            }
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {copied === "routing" ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {bankInfo.bankAccountNumber && (
                      <div>
                        <p className="text-xs text-blue-600">Account Number</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono font-medium text-blue-900">
                            {bankInfo.bankAccountNumber}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                bankInfo.bankAccountNumber,
                                "account"
                              )
                            }
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {copied === "account" ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {bankInfo.bankAccountType && (
                    <div>
                      <p className="text-xs text-blue-600">Account Type</p>
                      <p className="text-sm font-medium text-blue-900 capitalize">
                        {bankInfo.bankAccountType}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {bankInfo.zelleEmail && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">Zelle</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-blue-900">
                      {bankInfo.zelleEmail}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(bankInfo.zelleEmail, "zelle")
                      }
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {copied === "zelle" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {bankInfo.paymentInstructions && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-800 mb-1">
                  Payment Instructions
                </p>
                <p className="text-sm text-amber-700">
                  {bankInfo.paymentInstructions}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
            <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              Bank account information has not been set up yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Please contact your property manager for payment details.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/payments"
          className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          Back to Payments
        </Link>
      </div>
    </div>
  );
}
