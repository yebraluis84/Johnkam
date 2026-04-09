"use client";

import { useState, useEffect } from "react";
import { Megaphone, AlertTriangle, Info, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: string;
  author: string;
  createdAt: string;
}

const priorityStyles: Record<string, { border: string; bg: string; icon: React.ReactNode; label: string; labelColor: string }> = {
  urgent: {
    border: "border-l-red-500",
    bg: "bg-red-50",
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    label: "Urgent",
    labelColor: "bg-red-100 text-red-700",
  },
  important: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50",
    icon: <Bell className="w-5 h-5 text-yellow-600" />,
    label: "Important",
    labelColor: "bg-yellow-100 text-yellow-700",
  },
  normal: {
    border: "border-l-blue-500",
    bg: "bg-white",
    icon: <Info className="w-5 h-5 text-blue-500" />,
    label: "Info",
    labelColor: "bg-blue-100 text-blue-700",
  },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500 mt-0.5">
            Updates from your property management team
          </p>
        </div>
      </div>

      {announcements.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No announcements yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {announcements.map((ann) => {
          const style = priorityStyles[ann.priority] || priorityStyles.normal;
          return (
            <div
              key={ann.id}
              className={cn(
                "bg-white rounded-xl border border-slate-200 border-l-4 overflow-hidden transition hover:shadow-sm",
                style.border
              )}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                        style.bg
                      )}
                    >
                      {style.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-slate-900">
                          {ann.title}
                        </h2>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            style.labelColor
                          )}
                        >
                          {style.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        {ann.message}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                        <span>{ann.author}</span>
                        <span>&middot;</span>
                        <span>
                          {new Date(ann.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
