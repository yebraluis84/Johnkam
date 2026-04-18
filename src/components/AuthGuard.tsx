"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  role: string;
}

const publicPaths = ["/login", "/register", "/sign", "/apply"];
const adminPaths = ["/admin"];
const staffPaths = ["/staff"];
const tenantPaths = ["/dashboard", "/maintenance", "/messages", "/documents", "/announcements", "/profile", "/lease-renewal", "/payments", "/amenities", "/packages", "/surveys", "/community"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  function checkAuth() {
    // Public paths - always allowed
    if (publicPaths.some((p) => pathname.startsWith(p))) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    // API routes - skip
    if (pathname.startsWith("/api")) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    let user: User | null = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {}

    if (!user) {
      router.replace("/login");
      return;
    }

    const role = user.role;

    // Admin paths - ADMIN and MANAGEMENT
    if (adminPaths.some((p) => pathname.startsWith(p))) {
      if (role !== "ADMIN" && role !== "MANAGEMENT") {
        router.replace(role === "MAINTENANCE" ? "/staff/dashboard" : "/dashboard");
        return;
      }
    }

    // Staff paths - only MAINTENANCE
    if (staffPaths.some((p) => pathname.startsWith(p))) {
      if (role !== "MAINTENANCE") {
        const adminLike = role === "ADMIN" || role === "MANAGEMENT";
        router.replace(adminLike ? "/admin/dashboard" : "/dashboard");
        return;
      }
    }

    // Tenant paths - only TENANT
    if (tenantPaths.some((p) => pathname.startsWith(p))) {
      if (role !== "TENANT") {
        const adminLike = role === "ADMIN" || role === "MANAGEMENT";
        router.replace(adminLike ? "/admin/dashboard" : "/staff/dashboard");
        return;
      }
    }

    setAuthorized(true);
    setChecking(false);
  }

  if (checking && !publicPaths.some((p) => pathname.startsWith(p))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!authorized && !publicPaths.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return <>{children}</>;
}
