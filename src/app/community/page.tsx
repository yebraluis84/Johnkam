"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Plus,
  X,
  ThumbsUp,
  Pin,
  Trash2,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  unit: string | null;
  pinned: boolean;
  likes: number;
  createdAt: string;
}

const CATEGORIES = [
  { value: "general", label: "General", color: "bg-slate-100 text-slate-700" },
  { value: "event", label: "Event", color: "bg-blue-100 text-blue-700" },
  { value: "for-sale", label: "For Sale", color: "bg-green-100 text-green-700" },
  { value: "lost-found", label: "Lost & Found", color: "bg-yellow-100 text-yellow-700" },
  { value: "recommendation", label: "Recommendation", color: "bg-purple-100 text-purple-700" },
  { value: "question", label: "Question", color: "bg-orange-100 text-orange-700" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [user, setUser] = useState({ name: "", unit: "", role: "" });
  const [form, setForm] = useState({ title: "", content: "", category: "general" });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setUser({ name: stored.name || "", unit: stored.unit || "", role: stored.role || "" });
    } catch {}
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/community");
      if (res.ok) setPosts(await res.json());
    } catch {} finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, authorName: user.name, unit: user.unit }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ title: "", content: "", category: "general" });
      fetchPosts();
    }
  }

  async function handleLike(id: string, currentLikes: number) {
    await fetch("/api/community", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, likes: currentLikes + 1 }),
    });
    fetchPosts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/community?id=${id}`, { method: "DELETE" });
    fetchPosts();
  }

  async function togglePin(id: string, pinned: boolean) {
    await fetch("/api/community", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pinned: !pinned }),
    });
    fetchPosts();
  }

  const filtered = filterCat ? posts.filter((p) => p.category === filterCat) : posts;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Community Board</h1>
            <p className="text-slate-500 mt-0.5">Connect with your neighbors</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat("")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors", !filterCat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setFilterCat(c.value)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors", filterCat === c.value ? "bg-slate-900 text-white" : c.color + " hover:opacity-80")}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No posts yet</p>
            <p className="text-sm text-slate-400 mt-1">Be the first to share something with the community!</p>
          </div>
        ) : filtered.map((post) => {
          const cat = CATEGORIES.find((c) => c.value === post.category);
          return (
            <div key={post.id} className={cn("bg-white rounded-xl border p-5 transition hover:shadow-sm", post.pinned ? "border-blue-200 bg-blue-50/30" : "border-slate-200")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.pinned && <Pin className="w-3.5 h-3.5 text-blue-500" />}
                    <h3 className="font-semibold text-slate-900">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="font-medium">{post.authorName}</span>
                    {post.unit && <span>&middot; Unit {post.unit}</span>}
                    <span>&middot; {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span className={cn("px-2 py-0.5 rounded-full", cat?.color || "bg-slate-100 text-slate-700")}>{cat?.label || post.category}</span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                <button onClick={() => handleLike(post.id, post.likes)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition">
                  <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => togglePin(post.id, post.pinned)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition">
                      <Pin className="w-3.5 h-3.5" /> {post.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition ml-auto">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
                {!isAdmin && post.authorName === user.name && (
                  <button onClick={() => handleDelete(post.id)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition ml-auto">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Post Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">New Post</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required placeholder="What's on your mind?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={5} required placeholder="Share details, tips, or ask a question..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
