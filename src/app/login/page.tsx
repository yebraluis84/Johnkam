"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Shield, Wrench, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type LoginRole = "tenant" | "admin" | "staff";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<LoginRole>("tenant");
  const [error, setError] = useState("");

  const defaults = {
    tenant: { email: "", password: "" },
    admin: { email: "", password: "" },
    staff: { email: "", password: "" },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      if (data.role === "ADMIN" || data.role === "MANAGEMENT") {
        router.push("/admin/dashboard");
      } else if (data.role === "MAINTENANCE") {
        router.push("/staff/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-400 rounded-full blur-3xl" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            TenantHub
          </span>
        </div>
        <div className="space-y-6 relative z-10">
          <h1 className="text-4xl font-bold leading-tight">
            Your home,
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              managed simply.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            Submit maintenance requests, pay rent online, access your documents,
            and stay connected with property management — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {[
              "Online Payments",
              "Maintenance Requests",
              "Lease Documents",
              "Announcements",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-sm shadow-blue-400/50" />
                {feature}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500 relative z-10">
          &copy; 2026 TenantHub. All rights reserved.
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TenantHub</span>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100/80 backdrop-blur-sm rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={() => { setRole("tenant"); setError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                role === "tenant"
                  ? "bg-white text-slate-900 shadow-md shadow-slate-200/50"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Building2 className="w-4 h-4" />
              Tenant
            </button>
            <button
              type="button"
              onClick={() => { setRole("staff"); setError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                role === "staff"
                  ? "bg-white text-slate-900 shadow-md shadow-slate-200/50"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Wrench className="w-4 h-4" />
              Staff
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                role === "admin"
                  ? "bg-white text-slate-900 shadow-md shadow-slate-200/50"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {role === "admin" ? "Admin Login" : role === "staff" ? "Staff Login" : "Welcome back"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {role === "admin"
                ? "Sign in to the property management portal"
                : role === "staff"
                ? "Sign in to the maintenance staff portal"
                : "Sign in to your tenant portal"}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                key={role}
                defaultValue={defaults[role].email}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition shadow-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  key={`pw-${role}`}
                  defaultValue={defaults[role].password}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition pr-10 shadow-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 px-4 text-white rounded-xl text-sm font-semibold focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                role === "admin"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 focus:ring-emerald-500 shadow-emerald-500/25"
                  : role === "staff"
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 focus:ring-orange-500 shadow-orange-500/25"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:ring-blue-500 shadow-blue-500/25"
              )}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {role === "tenant" && (
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contact your property manager
                </Link>
              </p>
              <p className="text-sm text-slate-500">
                Interested in renting?{" "}
                <Link
                  href="/apply"
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Submit your application here
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
