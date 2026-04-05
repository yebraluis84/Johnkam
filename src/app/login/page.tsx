"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type LoginRole = "tenant" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<LoginRole>("tenant");
  const [error, setError] = useState("");

  const defaults = {
    tenant: { email: "", password: "" },
    admin: { email: "", password: "" },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      console.log("Login attempt:", { email, password: "***" });
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", res.status);
      const data = await res.json();
      console.log("Login response data:", data);

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Store user info in localStorage for session
      localStorage.setItem("user", JSON.stringify(data));

      if (data.role === "ADMIN") {
        router.push("/admin/dashboard");
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
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Building2 className="w-10 h-10 text-blue-400" />
          <span className="text-2xl font-bold">TenantHub</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Your home,
            <br />
            managed simply.
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
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {feature}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500">
          &copy; 2026 TenantHub. All rights reserved.
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">TenantHub</span>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setRole("tenant"); setError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition",
                role === "tenant"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Building2 className="w-4 h-4" />
              Tenant
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition",
                role === "admin"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {role === "admin" ? "Admin Login" : "Welcome back"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {role === "admin"
                ? "Sign in to the property management portal"
                : "Sign in to your tenant portal"}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
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
                "w-full py-2.5 px-4 text-white rounded-lg text-sm font-medium focus:ring-2 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed",
                role === "admin"
                  ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              )}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {role === "tenant" && (
            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact your property manager
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
