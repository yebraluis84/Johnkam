"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  X,
  Trash2,
  Copy,
  Eye,
  FileSignature,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: string[];
  createdAt: string;
}

const TEMPLATE_TYPES = [
  { value: "lease", label: "Lease Agreement" },
  { value: "notice-to-vacate", label: "Notice to Vacate" },
  { value: "rent-increase", label: "Rent Increase Letter" },
  { value: "welcome", label: "Welcome Letter" },
  { value: "late-payment", label: "Late Payment Notice" },
  { value: "maintenance-notice", label: "Maintenance Notice" },
  { value: "renewal-offer", label: "Renewal Offer" },
  { value: "custom", label: "Custom" },
];

/* eslint-disable no-template-curly-in-string */
const DEFAULT_TEMPLATES: Record<string, { content: string; variables: string[] }> = {
  "lease": {
    content: [
      "RESIDENTIAL LEASE AGREEMENT",
      "",
      "This Lease Agreement (\"Agreement\") is entered into as of {{date}} between:",
      "",
      "LANDLORD: {{propertyName}}",
      "Address: {{propertyAddress}}",
      "",
      "TENANT: {{tenantName}}",
      "Email: {{tenantEmail}}",
      "",
      "PROPERTY: Unit {{unitNumber}}",
      "",
      "TERM: This lease shall commence on {{leaseStart}} and terminate on {{leaseEnd}}.",
      "",
      "RENT: Tenant agrees to pay monthly rent of ${{rentAmount}} due on the {{dueDay}}th of each month.",
      "",
      "SECURITY DEPOSIT: ${{depositAmount}}",
      "",
      "LATE FEES: A late fee of ${{lateFeeAmount}} will be assessed if rent is not received within {{graceDays}} days of the due date.",
      "",
      "UTILITIES: Tenant is responsible for the following utilities: {{utilities}}",
      "",
      "OCCUPANTS: The premises shall be occupied only by the tenant named above.",
      "",
      "PETS: {{petPolicy}}",
      "",
      "SIGNATURES:",
      "",
      "Landlord: _________________________ Date: __________",
      "Tenant: _________________________ Date: __________",
    ].join("\n"),
    variables: ["date", "propertyName", "propertyAddress", "tenantName", "tenantEmail", "unitNumber", "leaseStart", "leaseEnd", "rentAmount", "dueDay", "depositAmount", "lateFeeAmount", "graceDays", "utilities", "petPolicy"],
  },
  "notice-to-vacate": {
    content: [
      "NOTICE TO VACATE",
      "",
      "Date: {{date}}",
      "",
      "Dear {{tenantName}},",
      "",
      "This letter serves as formal notice that your tenancy at {{propertyName}}, Unit {{unitNumber}}, will terminate on {{moveOutDate}}.",
      "",
      "Please ensure that:",
      "1. All personal belongings are removed by the termination date",
      "2. The unit is cleaned and returned to its original condition",
      "3. All keys and access devices are returned to management",
      "4. A forwarding address is provided for security deposit return",
      "",
      "Your security deposit will be returned within {{depositReturnDays}} days after move-out inspection, less any deductions for damages beyond normal wear and tear.",
      "",
      "Please contact management to schedule your move-out inspection.",
      "",
      "Sincerely,",
      "{{propertyName}} Management",
    ].join("\n"),
    variables: ["date", "tenantName", "propertyName", "unitNumber", "moveOutDate", "depositReturnDays"],
  },
  "rent-increase": {
    content: [
      "RENT INCREASE NOTICE",
      "",
      "Date: {{date}}",
      "",
      "Dear {{tenantName}},",
      "",
      "This letter is to inform you that effective {{effectiveDate}}, your monthly rent for Unit {{unitNumber}} at {{propertyName}} will be adjusted as follows:",
      "",
      "Current Rent: ${{currentRent}}/month",
      "New Rent: ${{newRent}}/month",
      "Increase: ${{increaseAmount}}/month",
      "",
      "This adjustment reflects {{reason}}.",
      "",
      "Your new rent of ${{newRent}} will be due on the {{dueDay}}th of each month beginning {{effectiveDate}}.",
      "",
      "If you have any questions, please contact our office.",
      "",
      "Sincerely,",
      "{{propertyName}} Management",
    ].join("\n"),
    variables: ["date", "tenantName", "unitNumber", "propertyName", "currentRent", "newRent", "increaseAmount", "effectiveDate", "dueDay", "reason"],
  },
  "late-payment": {
    content: [
      "LATE PAYMENT NOTICE",
      "",
      "Date: {{date}}",
      "",
      "Dear {{tenantName}},",
      "",
      "This notice is to inform you that your rent payment for Unit {{unitNumber}} at {{propertyName}} is past due.",
      "",
      "Amount Due: ${{amountDue}}",
      "Original Due Date: {{dueDate}}",
      "Days Overdue: {{daysOverdue}}",
      "Late Fee Applied: ${{lateFee}}",
      "Total Amount Due: ${{totalDue}}",
      "",
      "Please make payment immediately to avoid further action. You can pay online through your tenant portal or contact our office for payment arrangements.",
      "",
      "Sincerely,",
      "{{propertyName}} Management",
    ].join("\n"),
    variables: ["date", "tenantName", "unitNumber", "propertyName", "amountDue", "dueDate", "daysOverdue", "lateFee", "totalDue"],
  },
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: "", type: "lease", content: "", variables: "" });

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/document-templates");
      if (res.ok) setTemplates(await res.json());
    } catch {} finally { setLoading(false); }
  }

  function loadDefault(type: string) {
    const def = DEFAULT_TEMPLATES[type];
    if (def) {
      setForm({ ...form, type, content: def.content, variables: def.variables.join(", ") });
    } else {
      setForm({ ...form, type });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/document-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        content: form.content,
        variables: form.variables.split(",").map((v) => v.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ name: "", type: "lease", content: "", variables: "" });
      fetchTemplates();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/document-templates?id=${id}`, { method: "DELETE" });
    fetchTemplates();
  }

  function duplicateTemplate(t: Template) {
    setForm({ name: `${t.name} (Copy)`, type: t.type, content: t.content, variables: t.variables.join(", ") });
    setShowForm(true);
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileSignature className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Document Templates</h1>
            <p className="text-slate-500 mt-0.5">Pre-built templates for leases, notices & letters</p>
          </div>
        </div>
        <button onClick={() => { setForm({ name: "", type: "lease", content: "", variables: "" }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading...</div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No templates yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first document template to get started</p>
          </div>
        ) : templates.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900">{t.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 mt-1 inline-block">
                  {TEMPLATE_TYPES.find((tt) => tt.value === t.type)?.label || t.type}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3 line-clamp-3">{t.content.substring(0, 150)}...</p>
            {t.variables.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {t.variables.slice(0, 5).map((v) => (
                  <span key={v} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{`{{${v}}}`}</span>
                ))}
                {t.variables.length > 5 && <span className="text-xs text-slate-400">+{t.variables.length - 5} more</span>}
              </div>
            )}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setPreview(t)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"><Eye className="w-3.5 h-3.5" /> Preview</button>
              <button onClick={() => duplicateTemplate(t)} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-700"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
              <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 ml-auto"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">Create Template</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required placeholder="e.g., Standard Lease Agreement" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => loadDefault(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {TEMPLATE_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                </div>
              </div>
              {DEFAULT_TEMPLATES[form.type] && !form.content && (
                <button type="button" onClick={() => loadDefault(form.type)} className="text-sm text-blue-600 hover:text-blue-700">
                  Load default template for {TEMPLATE_TYPES.find((t) => t.value === form.type)?.label}
                </button>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" rows={15} required placeholder="Use {{variableName}} for dynamic fields..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Variables (comma-separated)</label>
                <input type="text" value={form.variables} onChange={(e) => setForm({ ...form, variables: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="tenantName, unitNumber, rentAmount" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">{preview.name}</h2>
              <button onClick={() => setPreview(null)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 rounded-lg p-5 border border-slate-200">{preview.content}</pre>
              {preview.variables.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {preview.variables.map((v) => (
                      <span key={v} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{`{{${v}}}`}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
