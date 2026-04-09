"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, FileText, Loader2, AlertCircle } from "lucide-react";

interface DocumentData {
  id: string;
  name: string;
  content: string;
  status: string;
  signedAt: string | null;
  signedName: string | null;
  tenantName: string;
  unitNumber: string;
}

export default function SignDocumentPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedName, setSignedName] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/documents/sign?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDoc(data);
          if (data.status === "signed") {
            setSigned(true);
            setSignedAt(data.signedAt);
          }
        }
      })
      .catch(() => setError("Failed to load document"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSign() {
    if (!signedName.trim()) return;
    setSigning(true);
    try {
      const res = await fetch("/api/documents/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signedName: signedName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSigned(true);
        setSignedAt(data.signedAt);
      } else {
        setError(data.error || "Failed to sign document");
      }
    } catch {
      setError("Failed to sign document");
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-slate-500">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error && !doc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Document Not Found</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">{doc.name}</h1>
              <p className="text-sm text-slate-500">
                {doc.tenantName} {doc.unitNumber ? `- Unit ${doc.unitNumber}` : ""}
              </p>
            </div>
          </div>
          {signed && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Signed</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Document Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 mb-6">
          <div
            className="prose prose-slate max-w-none"
            style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
          >
            {doc.content}
          </div>
        </div>

        {/* Signing Section */}
        {signed ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-green-800 mb-1">Document Signed</h2>
            <p className="text-green-700">
              Signed by <strong>{doc.signedName || signedName}</strong>
            </p>
            {signedAt && (
              <p className="text-sm text-green-600 mt-1">
                on {new Date(signedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Electronic Signature</h2>
            <p className="text-sm text-slate-500 mb-4">
              By typing your full legal name below and clicking &quot;Sign Document&quot;, you agree to the
              terms and conditions outlined in this document. This constitutes a legally binding
              electronic signature.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={signedName}
                  onChange={(e) => setSignedName(e.target.value)}
                  placeholder="Type your full legal name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
                />
              </div>

              {signedName.trim() && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Signature Preview</p>
                  <p
                    className="text-2xl text-slate-800"
                    style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
                  >
                    {signedName}
                  </p>
                </div>
              )}

              <button
                onClick={handleSign}
                disabled={!signedName.trim() || signing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {signing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  "Sign Document"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
