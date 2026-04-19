"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  Building2,
  CheckCircle2,
  Loader2,
  Clock,
  Download,
  RefreshCw,
  Landmark,
  Smartphone,
  FileText,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentRecord {
  id: string;
  amount: number;
  description: string;
  method: string;
  status: string;
  confirmationNumber: string | null;
  createdAt: string;
}

interface PropertyInfo {
  name: string;
  paymentDueDay: number;
  lateFeeGraceDays: number;
  lateFeeAmount: number;
  acceptCreditCard: boolean;
  acceptACH: boolean;
  bankName: string;
  bankAccountHolder: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountType: string;
  zelleEmail: string;
  paymentInstructions: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    amount: "",
    method: "ach",
    description: "Rent Payment",
  });
  const [tenantId, setTenantId] = useState("");
  const [balance, setBalance] = useState(0);
  const [rentAmount, setRentAmount] = useState(0);
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [autopay, setAutopay] = useState(false);
  const [togglingAutopay, setTogglingAutopay] = useState(false);
  const [showPayInfo, setShowPayInfo] = useState(false);
  const [tab, setTab] = useState<"history" | "methods">("history");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const tId = user.tenantId || "";
      setTenantId(tId);
      if (!tId) {
        setLoading(false);
        return;
      }

      Promise.all([
        fetch(`/api/payments?tenantId=${tId}`)
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
        fetch("/api/tenants")
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
        fetch("/api/property")
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch(`/api/autopay?tenantId=${tId}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]).then(([pays, tenants, prop, autopayData]) => {
        setPayments(Array.isArray(pays) ? pays : []);
        const me = Array.isArray(tenants)
          ? tenants.find((t: { id: string }) => t.id === tId)
          : null;
        if (me) {
          setBalance(me.balance || 0);
          setRentAmount(me.rentAmount || 0);
          setForm((f) => ({ ...f, amount: String(me.rentAmount || "") }));
        }
        if (prop) setProperty(prop);
        if (autopayData) setAutopay(autopayData.autopayEnabled);
      }).finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  async function handlePay() {
    if (!form.amount || !tenantId) return;
    setPaying(true);
    try {
      const amount = parseFloat(form.amount);

      if (form.method === "credit_card") {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            amount,
            description: form.description,
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        if (data.error) {
          alert(data.error);
          setPaying(false);
          return;
        }
      }

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tenantId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(data.confirmationNumber);
        setShowPay(false);
        setBalance((b) => b - amount);
        const updated = await fetch(
          `/api/payments?tenantId=${tenantId}`
        ).then((r) => r.json());
        setPayments(updated);
      }
    } catch {}
    setPaying(false);
  }

  async function toggleAutopay() {
    setTogglingAutopay(true);
    try {
      const res = await fetch("/api/autopay", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, enabled: !autopay }),
      });
      if (res.ok) setAutopay(!autopay);
    } catch {}
    setTogglingAutopay(false);
  }

  function downloadReceipt(p: PaymentRecord) {
    const lines = [
      "=========================================",
      "           PAYMENT RECEIPT",
      "=========================================",
      "",
      `Date:          ${new Date(p.createdAt).toLocaleDateString()}`,
      `Confirmation:  ${p.confirmationNumber || "N/A"}`,
      `Description:   ${p.description}`,
      `Method:        ${p.method.toUpperCase()}`,
      `Amount:        $${p.amount.toFixed(2)}`,
      `Status:        ${p.status.toUpperCase()}`,
      "",
      `-----------------------------------------`,
      `Property:      ${property?.name || "TenantHub"}`,
      "",
      "Thank you for your payment!",
      "=========================================",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${p.confirmationNumber || p.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const header = "Date,Description,Method,Amount,Status,Confirmation\n";
    const rows = payments
      .map(
        (p) =>
          `${new Date(p.createdAt).toLocaleDateString()},"${p.description}",${p.method.toUpperCase()},${p.amount.toFixed(2)},${p.status},${p.confirmationNumber || ""}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const quickAmounts = [
    { label: "Full Rent", value: rentAmount },
    ...(balance > 0 && balance !== rentAmount
      ? [{ label: "Full Balance", value: balance }]
      : []),
    ...(rentAmount > 0
      ? [{ label: "Half Rent", value: Math.round(rentAmount / 2 * 100) / 100 }]
      : []),
  ];

  const nextDueDate = (() => {
    if (!property) return null;
    const now = new Date();
    const dueDay = property.paymentDueDay;
    let due = new Date(now.getFullYear(), now.getMonth(), dueDay);
    if (due <= now) due = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
    return due;
  })();

  const daysUntilDue = nextDueDate
    ? Math.ceil(
        (nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
            <p className="text-slate-500 mt-0.5">
              Manage your rent payments
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setForm((f) => ({
              ...f,
              amount: String(balance > 0 ? balance : rentAmount),
            }));
            setShowPay(true);
          }}
          className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <DollarSign className="w-4 h-4" /> Make Payment
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">
              Payment Successful!
            </p>
            <p className="text-sm text-green-700">
              Confirmation: {success}
            </p>
          </div>
          <button
            onClick={() => setSuccess("")}
            className="text-sm text-green-700 hover:text-green-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Monthly Rent</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${rentAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Current Balance</p>
          <p
            className={cn(
              "text-2xl font-bold mt-1",
              balance > 0 ? "text-red-600" : "text-green-600"
            )}
          >
            ${balance.toFixed(2)}
          </p>
          {balance > 0 && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Outstanding
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Next Due</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {daysUntilDue !== null ? `${daysUntilDue}d` : "—"}
          </p>
          {nextDueDate && (
            <p className="text-xs text-slate-400 mt-0.5">
              {nextDueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Paid</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            $
            {payments
              .filter((p) => p.status === "completed")
              .reduce((s, p) => s + p.amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Autopay Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw
            className={cn(
              "w-5 h-5",
              autopay ? "text-green-600" : "text-slate-400"
            )}
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              AutoPay
            </p>
            <p className="text-xs text-slate-500">
              {autopay
                ? `Automatically pays $${rentAmount.toFixed(2)} on the ${property?.paymentDueDay || 1}${property?.paymentDueDay === 1 ? "st" : property?.paymentDueDay === 2 ? "nd" : property?.paymentDueDay === 3 ? "rd" : "th"} of each month`
                : "Set up automatic monthly rent payments"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleAutopay}
          disabled={togglingAutopay}
          className="flex items-center gap-2"
        >
          {togglingAutopay ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : autopay ? (
            <ToggleRight className="w-8 h-8 text-green-600" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-slate-400" />
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setTab("history")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition",
            tab === "history"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Payment History
        </button>
        <button
          onClick={() => setTab("methods")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition",
            tab === "methods"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Payment Methods
        </button>
      </div>

      {/* Payment History Tab */}
      {tab === "history" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Payment History
            </h2>
            {payments.length > 0 && (
              <button
                onClick={exportCSV}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      p.status === "completed"
                        ? "bg-green-100"
                        : "bg-yellow-100"
                    )}
                  >
                    {p.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {p.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()} &middot;{" "}
                      {p.method.toUpperCase()}{" "}
                      {p.confirmationNumber
                        ? `\u00B7 ${p.confirmationNumber}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-slate-900">
                    ${p.amount.toFixed(2)}
                  </p>
                  {p.status === "completed" && p.confirmationNumber && (
                    <button
                      onClick={() => downloadReceipt(p)}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                      title="Download receipt"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                No payment history
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {tab === "methods" && (
        <div className="space-y-4">
          {property?.acceptACH && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">
                  Bank Transfer (ACH)
                </h3>
              </div>
              {property.bankName ? (
                <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Bank Name</p>
                    <p className="text-slate-700 font-medium">
                      {property.bankName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Account Holder</p>
                    <p className="text-slate-700 font-medium">
                      {property.bankAccountHolder}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Routing Number</p>
                    <p className="text-slate-700 font-mono">
                      {property.bankRoutingNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Account Number</p>
                    <p className="text-slate-700 font-mono">
                      ****{property.bankAccountNumber.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Account Type</p>
                    <p className="text-slate-700 capitalize">
                      {property.bankAccountType}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Bank details not configured. Contact management.
                </p>
              )}
            </div>
          )}

          {property?.acceptCreditCard && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-slate-900">
                  Credit / Debit Card
                </h3>
              </div>
              <p className="text-sm text-slate-500">
                Pay securely using your credit or debit card through the
                portal. Select &quot;Credit Card&quot; when making a payment.
              </p>
            </div>
          )}

          {property?.zelleEmail && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Zelle</h3>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">
                  Send payment to:
                </p>
                <p className="text-slate-700 font-medium">
                  {property.zelleEmail}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Include your unit number in the memo. Zelle payments may
                take 1-2 business days to reflect.
              </p>
            </div>
          )}

          {property?.paymentInstructions && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">
                  Payment Instructions
                </h3>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {property.paymentInstructions}
              </p>
            </div>
          )}

          {/* Late fee info */}
          {property && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">
                  Late Fee Policy
                </h3>
              </div>
              <p className="text-sm text-amber-700">
                Rent is due on the{" "}
                <strong>
                  {property.paymentDueDay}
                  {property.paymentDueDay === 1
                    ? "st"
                    : property.paymentDueDay === 2
                      ? "nd"
                      : property.paymentDueDay === 3
                        ? "rd"
                        : "th"}
                </strong>{" "}
                of each month. A late fee of{" "}
                <strong>${property.lateFeeAmount.toFixed(2)}</strong> will be
                applied if payment is not received within{" "}
                <strong>{property.lateFeeGraceDays} days</strong> of the due
                date.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Make Payment Modal */}
      {showPay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Make a
              Payment
            </h3>

            {/* Quick amounts */}
            {quickAmounts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quick Select
                </label>
                <div className="flex gap-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q.label}
                      onClick={() =>
                        setForm({ ...form, amount: String(q.value) })
                      }
                      className={cn(
                        "flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition",
                        form.amount === String(q.value)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {q.label}
                      <br />${q.value.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {property?.acceptACH !== false && (
                  <button
                    onClick={() => setForm({ ...form, method: "ach" })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition text-xs font-medium",
                      form.method === "ach"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Landmark className="w-5 h-5" />
                    ACH
                  </button>
                )}
                {property?.acceptCreditCard !== false && (
                  <button
                    onClick={() =>
                      setForm({ ...form, method: "credit_card" })
                    }
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition text-xs font-medium",
                      form.method === "credit_card"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <CreditCard className="w-5 h-5" />
                    Card
                  </button>
                )}
                <button
                  onClick={() => setForm({ ...form, method: "check" })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition text-xs font-medium",
                    form.method === "check"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <FileText className="w-5 h-5" />
                  Check
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPay(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={
                  paying || !form.amount || parseFloat(form.amount) <= 0
                }
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {paying
                  ? "Processing..."
                  : `Pay $${parseFloat(form.amount || "0").toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
