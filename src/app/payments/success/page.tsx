"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const timer = setTimeout(() => setStatus("success"), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (status === "loading") {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        <p className="text-slate-500">Confirming your payment...</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Payment Successful!</h1>
        <p className="text-slate-500 mt-2">
          Your payment has been processed. You&apos;ll receive a confirmation email shortly.
        </p>
      </div>
      <Link
        href="/payments"
        className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
      >
        Back to Payments
      </Link>
    </div>
  );
}
