"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket { id: string; ticketNumber: string; title: string; category: string; priority: string; status: string; scheduledDate: string; tenantName: string; unit: string; }

export default function StaffCalendarPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => { fetch("/api/tickets").then(r => r.ok ? r.json() : []).then(d => setTickets(Array.isArray(d) ? d : [])).catch(() => []).finally(() => setLoading(false)); }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function getTicketsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tickets.filter(t => t.scheduledDate === dateStr || t.scheduledDate?.startsWith(dateStr));
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const priorityColor = (p: string) => p === "urgent" ? "bg-red-500" : p === "high" ? "bg-orange-500" : p === "medium" ? "bg-blue-500" : "bg-slate-400";

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  // Get scheduled and open tickets for sidebar
  const upcomingTickets = tickets.filter(t => t.status !== "completed" && t.status !== "closed").slice(0, 10);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><CalendarDays className="w-5 h-5 text-orange-600" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Work Order Calendar</h1><p className="text-slate-500 mt-0.5">Scheduled maintenance overview</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
            <h2 className="font-semibold text-slate-900">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="bg-slate-50 p-2 text-center text-xs font-medium text-slate-500">{d}</div>
            ))}
            {days.map((day, i) => {
              const dayTickets = day ? getTicketsForDay(day) : [];
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              return (
                <div key={i} className={cn("bg-white min-h-[80px] p-1.5", !day && "bg-slate-50")}>
                  {day && (<>
                    <p className={cn("text-xs font-medium mb-1", isToday ? "text-blue-600 font-bold" : "text-slate-600")}>{day}</p>
                    <div className="space-y-0.5">{dayTickets.slice(0, 3).map(t => (
                      <div key={t.id} className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] bg-slate-50 truncate">
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", priorityColor(t.priority))} />
                        <span className="truncate text-slate-700">{t.title}</span>
                      </div>
                    ))}{dayTickets.length > 3 && <p className="text-[10px] text-slate-400 px-1">+{dayTickets.length - 3} more</p>}</div>
                  </>)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Upcoming */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Active Work Orders</h2>
          <div className="space-y-2">
            {upcomingTickets.map(t => (
              <div key={t.id} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", priorityColor(t.priority))} />
                  <p className="text-sm font-medium text-slate-900 truncate">{t.title}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t.ticketNumber} &middot; Unit {t.unit}</p>
                {t.scheduledDate && <p className="text-xs text-blue-600 mt-0.5">Scheduled: {t.scheduledDate}</p>}
              </div>
            ))}
            {upcomingTickets.length === 0 && <p className="text-sm text-slate-400">No active work orders</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
