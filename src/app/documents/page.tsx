"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ScrollText,
  Loader2,
} from "lucide-react";

interface LeaseDoc {
  id: string;
  name: string;
  status: string;
  signedAt: string | null;
  signedName: string | null;
  createdAt: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<LeaseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Get tenantId from localStorage
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const tenantId = stored.tenantId;
    if (!tenantId) {
      setLoading(false);
      return;
    }

    fetch(`/api/documents?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((data) => {
        setDocs(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load documents:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="text-slate-500 mt-1">
          Your lease documents and agreements
        </p>
      </div>

      {/* Search */}
      {docs.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      )}

      {/* Document List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No documents yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Documents sent by your property manager will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 bg-blue-50">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>Lease</span>
                    <span>&middot;</span>
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {doc.status === "signed" ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-700">Signed</p>
                      {doc.signedAt && (
                        <p className="text-xs text-slate-400">
                          {new Date(doc.signedAt).toLocaleDateString()}
                          {doc.signedName && ` by ${doc.signedName}`}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <p className="text-sm font-medium text-yellow-700">
                      Awaiting Signature
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
