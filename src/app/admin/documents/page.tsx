"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  X,
  Search,
} from "lucide-react";

interface TenantOption {
  id: string;
  name: string;
  email: string;
  unit: string;
}

interface LeaseDoc {
  id: string;
  name: string;
  status: string;
  tenantName: string;
  tenantEmail: string;
  unitNumber: string;
  signedAt: string | null;
  signedName: string | null;
  createdAt: string;
}

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<LeaseDoc[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [selectedTenant, setSelectedTenant] = useState("");
  const [docName, setDocName] = useState("");
  const [docContent, setDocContent] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [docsRes, tenantsRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/tenants"),
      ]);
      const docsData = await docsRes.json();
      const tenantsData = await tenantsRes.json();
      setDocs(Array.isArray(docsData) ? docsData : []);
      setTenants(Array.isArray(tenantsData) ? tenantsData : []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!selectedTenant || !docName.trim() || !docContent.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenant,
          name: docName.trim(),
          content: docContent.trim(),
          sendEmail: true,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setShowCreate(false);
        setSelectedTenant("");
        setDocName("");
        setDocContent("");
        loadData();
      }
    } catch (err) {
      console.error("Failed to create document:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = docs.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.tenantName.toLowerCase().includes(q) ||
      d.unitNumber.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lease Documents</h1>
          <p className="text-slate-500 mt-1">Create and manage lease documents for tenants</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Lease
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, tenant, or unit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      {/* Documents Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No lease documents yet</p>
          <p className="text-sm text-slate-400 mt-1">Create one to send to a tenant for e-signature</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Document</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Tenant</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Unit</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-900">{doc.tenantName}</p>
                      <p className="text-xs text-slate-400">{doc.tenantEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{doc.unitNumber || "-"}</td>
                    <td className="px-5 py-4">
                      {doc.status === "signed" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Signed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {doc.signedAt
                        ? new Date(doc.signedAt).toLocaleDateString()
                        : new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                        title="Delete document"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Create Lease Document</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Tenant
                </label>
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Choose a tenant...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — Unit {t.unit} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Lease Agreement - Unit 101"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lease Content
                </label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  rows={12}
                  placeholder="Enter the full lease agreement text here..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedTenant || !docName.trim() || !docContent.trim() || sending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Create & Send to Tenant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
