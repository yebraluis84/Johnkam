"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Wrench,
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  X,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StaffNotificationBell from "./StaffNotificationBell";

const navItems = [
  { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/tickets", label: "Tickets", icon: Wrench },
  { href: "/staff/calendar", label: "Calendar", icon: CalendarDays },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({ name: "" });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setUser({ name: stored.name || "" });
    } catch {}
  }, []);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-40 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-orange-500" />
          <span className="text-base font-bold text-slate-900">TenantHub</span>
        </div>
        <div className="bg-slate-900 rounded-lg">
          <StaffNotificationBell />
        </div>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <Link href="/staff/dashboard" className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-orange-400" />
            <span className="text-lg font-bold tracking-tight">TenantHub</span>
          </Link>
          <div className="flex items-center gap-1">
            <div className="hidden lg:block">
              <StaffNotificationBell />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-800 rounded"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
              {user.name
                ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                : "?"}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name || "Loading..."}</p>
              <div className="flex items-center gap-1">
                <Wrench className="w-3 h-3 text-orange-400" />
                <p className="text-xs text-orange-400">Maintenance Staff</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}
