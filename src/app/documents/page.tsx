"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  File,
  ScrollText,
  Receipt,
  Shield,
} from "lucide-react";
import { documents } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  lease: {
    label: "Lease",
    icon: <ScrollText className="w-5 h-5" />,
    color: "text-blue-600 bg-blue-50",
  },
  addendum: {
    label: "Addendum",
    icon: <FileText className="w-5 h-5" />,
    color: "text-purple-600 bg-purple-50",
  },
  notice: {
    label: "Notice",
    icon: <File className="w-5 h-5" />,
    color: "text-orange-600 bg-orange-50",
  },
  receipt: {
    label: "Receipt",
    icon: <Receipt className="w-5 h-5" />,
    color: "text-green-600 bg-green-50",
  },
  policy: {
    label: "Policy",
    icon: <Shield className="w-5 h-5" />,
    color: "text-slate-600 bg-slate-100",
  },
};

export default function DocumentsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = documents.filter((doc) => {
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="text-slate-500 mt-1">
          Access your lease, receipts, and property documents
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
          >
            <option value="all">All Types</option>
            <option value="lease">Lease</option>
            <option value="addendum">Addendum</option>
            <option value="notice">Notice</option>
            <option value="receipt">Receipt</option>
            <option value="policy">Policy</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const config = typeConfig[doc.type] || typeConfig.policy;
          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    config.color
                  )}
                >
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{config.label}</span>
                    <span>&middot;</span>
                    <span>{doc.size}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(doc.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition">
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-md hover:bg-slate-100 transition">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No documents found</p>
        </div>
      )}
    </div>
  );
}
