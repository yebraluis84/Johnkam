"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Star, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Survey { id: string; title: string; description: string | null; questions: { text: string; type: string }[]; status: string; }

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Survey | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/surveys").then(r => r.ok ? r.json() : []).then(d => setSurveys(Array.isArray(d) ? d.filter((s: Survey) => s.status === "active") : [])).catch(() => []).finally(() => setLoading(false));
  }, []);

  function openSurvey(s: Survey) {
    setActive(s); setRating(0); setComment(""); setAnswers(s.questions.map(() => ""));
  }

  async function handleSubmit() {
    if (!active) return;
    setSubmitting(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      await fetch("/api/surveys/responses", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: active.id, tenantId: user.tenantId, tenantName: user.name, unit: user.unit, answers, rating, comment }) });
      setSubmitted(prev => new Set(prev).add(active.id));
      setActive(null);
    } catch {} setSubmitting(false);
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center"><ClipboardList className="w-5 h-5 text-violet-600" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Surveys</h1><p className="text-slate-500 mt-0.5">Share your feedback</p></div>
      </div>

      <div className="space-y-4">
        {surveys.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div><h3 className="font-semibold text-slate-900">{s.title}</h3>{s.description && <p className="text-sm text-slate-500 mt-1">{s.description}</p>}</div>
              {submitted.has(s.id) ? (
                <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="w-4 h-4" /> Submitted</span>
              ) : (
                <button onClick={() => openSurvey(s)} className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition">Take Survey</button>
              )}
            </div>
          </div>
        ))}
        {surveys.length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No active surveys</div>}
      </div>

      {active && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 my-8">
            <h3 className="text-lg font-bold text-slate-900">{active.title}</h3>
            {active.questions.map((q, i) => (
              <div key={i}><label className="block text-sm font-medium text-slate-700 mb-1.5">{q.text}</label>
                <input type="text" value={answers[i]} onChange={e => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none" />
              </div>
            ))}
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Overall Rating</label>
              <div className="flex gap-1">{[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} className="p-1"><Star className={cn("w-6 h-6", n <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300")} /></button>
              ))}</div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Comments</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActive(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition disabled:opacity-50">{submitting ? "Submitting..." : "Submit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
