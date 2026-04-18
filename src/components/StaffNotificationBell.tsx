"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, Clock, X, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  ticketNumber: string;
  title: string;
  priority: string;
  status: string;
  tenantName: string;
  unit: string;
  createdAt: string;
  isHighPriority: boolean;
  isOverdue: boolean;
  reasons: string[];
}

interface Toast {
  id: string;
  ticketNumber: string;
  title: string;
  priority: string;
  reason: "new" | "urgent" | "overdue";
}

const LAST_SEEN_KEY = "staff_notifications_last_seen";
const DISMISSED_OVERDUE_KEY = "staff_notifications_dismissed_overdue";

function playBeep(urgent: boolean) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = urgent ? 880 : 660;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    if (urgent) {
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = "sine";
        osc2.frequency.value = 880;
        gain2.gain.setValueAtTime(0.001, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 350);
    }
  } catch {}
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function StaffNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return Date.now();
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  });
  const isFirstLoad = useRef(true);
  const knownIdsRef = useRef<Set<string>>(new Set());

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/staff-notifications");
      if (!res.ok) return;
      const data = await res.json();
      const items: Notification[] = data.notifications || [];
      setNotifications(items);

      if (isFirstLoad.current) {
        items.forEach((n) => knownIdsRef.current.add(n.id));
        isFirstLoad.current = false;
        return;
      }

      const newToasts: Toast[] = [];
      const dismissedOverdue = (() => {
        try {
          return new Set<string>(JSON.parse(localStorage.getItem(DISMISSED_OVERDUE_KEY) || "[]"));
        } catch {
          return new Set<string>();
        }
      })();

      items.forEach((n) => {
        const isNew = !knownIdsRef.current.has(n.id);
        if (isNew) {
          knownIdsRef.current.add(n.id);
          if (n.isHighPriority) {
            newToasts.push({ id: n.id, ticketNumber: n.ticketNumber, title: n.title, priority: n.priority, reason: "urgent" });
          } else {
            newToasts.push({ id: n.id, ticketNumber: n.ticketNumber, title: n.title, priority: n.priority, reason: "new" });
          }
        } else if (n.isOverdue && !dismissedOverdue.has(n.id)) {
          newToasts.push({ id: n.id, ticketNumber: n.ticketNumber, title: n.title, priority: n.priority, reason: "overdue" });
          dismissedOverdue.add(n.id);
        }
      });

      if (newToasts.length > 0) {
        const hasUrgent = newToasts.some((t) => t.reason === "urgent");
        playBeep(hasUrgent);
        setToasts((prev) => [...prev, ...newToasts].slice(-4));
        newToasts.forEach((t) => {
          setTimeout(() => {
            setToasts((prev) => prev.filter((x) => x.id !== t.id));
          }, 8000);
        });
        localStorage.setItem(DISMISSED_OVERDUE_KEY, JSON.stringify(Array.from(dismissedOverdue)));
      }
    } catch {}
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  function markAllSeen() {
    const now = Date.now();
    setLastSeen(now);
    localStorage.setItem(LAST_SEEN_KEY, String(now));
  }

  const unreadCount = notifications.filter(
    (n) => new Date(n.createdAt).getTime() > lastSeen || n.isHighPriority || n.isOverdue
  ).length;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => {
            setOpen((prev) => {
              if (!prev) markAllSeen();
              return !prev;
            });
          }}
          className="relative p-2 rounded-lg hover:bg-slate-800 transition"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-11 w-80 max-h-[70vh] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No active tickets</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href="/staff/tickets"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                              n.isHighPriority
                                ? "bg-red-50 text-red-600"
                                : n.isOverdue
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                            )}
                          >
                            {n.isHighPriority ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : n.isOverdue ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <Wrench className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 truncate">{n.title}</p>
                              {n.isHighPriority && (
                                <span className="text-[10px] font-bold uppercase text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                  {n.priority}
                                </span>
                              )}
                              {n.isOverdue && !n.isHighPriority && (
                                <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                  overdue
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {n.ticketNumber} · {n.tenantName} · Unit {n.unit}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <Link
                  href="/staff/tickets"
                  onClick={() => setOpen(false)}
                  className="block text-center py-2.5 text-sm font-medium text-orange-600 hover:bg-slate-50 border-t border-slate-200"
                >
                  View all tickets
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[60] space-y-2 max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg shadow-lg border animate-in slide-in-from-right",
                t.reason === "urgent"
                  ? "bg-red-50 border-red-200"
                  : t.reason === "overdue"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white border-slate-200"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  t.reason === "urgent"
                    ? "bg-red-100 text-red-600"
                    : t.reason === "overdue"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-blue-100 text-blue-600"
                )}
              >
                {t.reason === "urgent" ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : t.reason === "overdue" ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase text-slate-500">
                  {t.reason === "urgent" ? `New ${t.priority} ticket` : t.reason === "overdue" ? "Overdue ticket" : "New ticket"}
                </p>
                <p className="text-sm font-medium text-slate-900 truncate">{t.title}</p>
                <p className="text-xs text-slate-500">{t.ticketNumber}</p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
