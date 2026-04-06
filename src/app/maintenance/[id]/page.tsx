"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Calendar, User, Wrench as WrenchIcon } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { formatDate } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { tickets: maintenanceTickets } = useAppState();
  const ticket = maintenanceTickets.find((t) => t.id === id);
  const [newComment, setNewComment] = useState("");

  if (!ticket) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <Link
          href="/maintenance"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Maintenance
        </Link>
        <div className="text-center py-16 text-slate-400">
          Ticket not found
        </div>
      </div>
    );
  }

  const roleIcons: Record<string, React.ReactNode> = {
    tenant: <User className="w-4 h-4" />,
    TENANT: <User className="w-4 h-4" />,
    manager: <Calendar className="w-4 h-4" />,
    ADMIN: <Calendar className="w-4 h-4" />,
    maintenance: <WrenchIcon className="w-4 h-4" />,
    MAINTENANCE: <WrenchIcon className="w-4 h-4" />,
  };

  const roleColors: Record<string, string> = {
    tenant: "bg-blue-100 text-blue-700",
    TENANT: "bg-blue-100 text-blue-700",
    manager: "bg-purple-100 text-purple-700",
    ADMIN: "bg-purple-100 text-purple-700",
    maintenance: "bg-green-100 text-green-700",
    MAINTENANCE: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link
        href="/maintenance"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Maintenance
      </Link>

      {/* Ticket Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-slate-400 font-mono">
                {ticket.id}
              </span>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {ticket.title}
            </h1>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {ticket.description}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs">Category</p>
            <p className="text-slate-700 font-medium">{ticket.category}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Submitted</p>
            <p className="text-slate-700 font-medium">
              {formatDate(ticket.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Last Updated</p>
            <p className="text-slate-700 font-medium">
              {formatDate(ticket.updatedAt || ticket.createdAt)}
            </p>
          </div>
          {ticket.scheduledDate && (
            <div>
              <p className="text-slate-400 text-xs">Scheduled</p>
              <p className="text-slate-700 font-medium">
                {formatDate(ticket.scheduledDate)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Activity / Comments */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Activity</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Created event */}
          <div className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-slate-700">
                <span className="font-medium">{ticket.tenantName || "Tenant"}</span> submitted
                this request
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatDate(ticket.createdAt)}
              </p>
            </div>
          </div>

          {ticket.comments.map((comment) => {
            const commentRole = comment.role || comment.authorRole || "tenant";
            return (
            <div key={comment.id} className="p-4 flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${roleColors[commentRole] || "bg-slate-100 text-slate-700"}`}
              >
                {roleIcons[commentRole] || <User className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {comment.author}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">
                    {commentRole.toLowerCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {comment.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            </div>
          ); })}
        </div>

        {/* Add Comment */}
        {ticket.status !== "completed" && ticket.status !== "closed" && (
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                SJ
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Add a comment or update..."
                />
                <div className="flex justify-end mt-2">
                  <button
                    disabled={!newComment.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
