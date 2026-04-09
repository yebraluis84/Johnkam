"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { useAppState } from "@/lib/app-context";

const categories = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance",
  "Structural",
  "Pest Control",
  "Security",
  "General",
  "Other",
];

export default function NewMaintenancePage() {
  const router = useRouter();
  const { refreshData } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<{ name: string; data: string; preview: string }[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files);

    fileList.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return; // 10MB limit
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPhotos((prev) => [...prev, { name: file.name, data: base64, preview: base64 }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const priority = (form.elements.namedItem("priority") as HTMLSelectElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const location = (form.elements.namedItem("location") as HTMLInputElement).value;
    const entry = (form.elements.namedItem("entry") as HTMLInputElement)?.value || "yes";

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const tenantId = user.tenantId;
      if (!tenantId) { setError("No tenant ID found. Please log in again."); setLoading(false); return; }

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          priority,
          description,
          location,
          tenantId,
          entryPermission: entry,
          photos: photos.map((p) => p.data),
        }),
      });

      if (res.ok) {
        refreshData();
        router.push("/maintenance");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to submit request");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link
        href="/maintenance"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Maintenance
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Maintenance Request</h1>
        <p className="text-slate-500 mt-1">
          Describe the issue and we&apos;ll get it resolved as soon as possible
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">Issue Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Brief description of the issue"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1.5">Priority *</label>
            <select
              id="priority"
              name="priority"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              <option value="">Select priority</option>
              <option value="low">Low - Can wait</option>
              <option value="medium">Medium - Needs attention soon</option>
              <option value="high">High - Urgent issue</option>
              <option value="urgent">Urgent - Emergency (safety/flooding)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1.5">Location in Unit</label>
          <input
            id="location"
            name="location"
            type="text"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g., Kitchen, Master Bathroom, Living Room"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">Detailed Description *</label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            placeholder="Please provide as much detail as possible about the issue..."
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Photos / Attachments</label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              Drag & drop files or{" "}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB each</p>
          </div>

          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200">
                  <img src={photo.preview} alt={photo.name} className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                    <p className="text-xs text-white truncate">{photo.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Permission to Enter</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="entry" value="yes" defaultChecked className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-700">Yes, maintenance can enter when I&apos;m not home</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="entry" value="schedule" className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-700">Please schedule a time with me first</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/maintenance"
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
