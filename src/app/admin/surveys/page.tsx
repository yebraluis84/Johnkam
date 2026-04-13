"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, Trash2, Loader2, BarChart3 } from "lucide-react";

interface Survey { id: string; title: string; description: string | null; questions: { text: string; type: string }[]; status: string; responseCount: number; avgRating: number | null; createdAt: string; }

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", questions: [{ text: "", type: "text" }] });

  useEffect(() => { fetch("/api/surveys").then(r => r.ok ? r.json() : []).then(d => setSurveys(Array.isArray(d) ? d : [])).catch(() => []).finally(() => setLoading(false)); }, []);

  function addQuestion() { setForm(f => ({ ...f, questions: [...f.questions, { text: "", type: "text" }] })); }
  function updateQuestion(i: number, text: string) { setForm(f => ({ ...f, questions: f.questions.map((q, j) => j === i ? { ...q, text } : q) })); }
  function removeQuestion(i: number) { setForm(f => ({ ...f, questions: f.questions.filter((_, j) => j !== i) })); }

  async function handleCreate() {
    if (!form.title || form.questions.every(q => !q.text)) return; setCreating(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      const res = await fetch("/api/surveys", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, questions: form.questions.filter(q => q.text), createdBy: user.name }) });
      if (res.ok) { const d = await fetch("/api/surveys").then(r => r.json()); setSurveys(d); setShowCreate(false); setForm({ title: "", description: "", questions: [{ text: "", type: "text" }] }); }
    } catch {} setCreating(false);
  }

  async function handleDelete(id: string) { await fetch(`/api/surveys?id=${id}`, { method: "DELETE" }); setSurveys(prev => prev.filter(s => s.id !== id)); }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center"><ClipboardList className="w-5 h-5 text-violet-600" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Surveys</h1><p className="text-slate-500 mt-0.5">Create and manage tenant surveys</p></div>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition flex items-center gap-2"><Plus className="w-4 h-4" /> New Survey</button>
      </div>

      <div className="space-y-4">
        {surveys.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                {s.description && <p className="text-sm text-slate-500 mt-1">{s.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>{s.questions.length} questions</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{s.responseCount} responses</span>
                  {s.avgRating && <span>Avg rating: {s.avgRating}/5</span>}
                  <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {surveys.length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No surveys yet. Create one to get started.</div>}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900">Create Survey</h3>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Questions</label>
              <div className="space-y-2">
                {form.questions.map((q, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={q.text} onChange={e => updateQuestion(i, e.target.value)} placeholder={`Question ${i + 1}`} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" />
                    {form.questions.length > 1 && <button onClick={() => removeQuestion(i)} className="px-2 text-red-500 hover:text-red-700">&times;</button>}
                  </div>
                ))}
              </div>
              <button onClick={addQuestion} className="mt-2 text-sm text-violet-600 hover:text-violet-700">+ Add Question</button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.title} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition disabled:opacity-50">{creating ? "Creating..." : "Create Survey"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
