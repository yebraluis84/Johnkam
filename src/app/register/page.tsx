"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    const inviteCode = (form.elements.namedItem("invite") as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, inviteCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Account Activated!</h2>
          <p className="text-slate-500">
            Your account is now set up. You can log in with your email and the password you just created.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 justify-center mb-8">
          <Building2 className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">TenantHub</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center">
          Activate your account
        </h2>
        <p className="mt-1 text-sm text-slate-500 text-center mb-8">
          Enter your email and set a password to get started
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="invite" className="block text-sm font-medium text-slate-700 mb-1.5">
              Invitation Code
            </label>
            <input
              id="invite"
              name="invite"
              type="text"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="From your invitation email (optional)"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="The email your property manager used"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Create Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
          >
            {loading ? "Activating..." : "Activate Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
