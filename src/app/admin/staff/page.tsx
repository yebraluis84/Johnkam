"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Wrench,
  Search,
  Loader2,
  X,
  KeyRound,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("MAINTENANCE");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [resetModal, setResetModal] = useState<{ email: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    loadStaff();
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUserRole(stored.role || "");
    } catch {}
  }, []);

  async function loadStaff() {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role,
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.id) {
        setShowCreate(false);
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setRole("MAINTENANCE");
        setError("");
        loadStaff();
      }
    } catch {
      setError("Failed to create account");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this staff member?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/staff?id=${id}`, { method: "DELETE" });
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleResetPassword() {
    if (!resetModal || !newPassword.trim()) return;
    setResetting(true);
    setResetError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetModal.email, newPassword: newPassword.trim() }),
      });
      if (res.ok) {
        setResetSuccess(`Password reset for ${resetModal.name}`);
        setResetModal(null);
        setNewPassword("");
      } else {
        const data = await res.json();
        setResetError(data.error || "Failed to reset password");
      }
    } catch {
      setResetError("Network error");
    }
    setResetting(false);
  }

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = staff.filter((s) => s.role === "ADMIN").length;
  const managementCount = staff.filter((s) => s.role === "MANAGEMENT").length;
  const maintenanceCount = staff.filter((s) => s.role === "MAINTENANCE").length;

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
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 mt-1">Manage admin and maintenance staff accounts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Staff</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{adminCount}</p>
          <p className="text-xs text-slate-500 mt-1">Admins</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: "#fe13a8" }}>{managementCount}</p>
          <p className="text-xs text-slate-500 mt-1">Management</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{maintenanceCount}</p>
          <p className="text-xs text-slate-500 mt-1">Maintenance</p>
        </div>
      </div>

      {resetSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{resetSuccess}</p>
          </div>
          <button onClick={() => setResetSuccess("")} className="text-green-600 hover:text-green-800"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      {/* Staff List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No staff members found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Phone</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Created</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            backgroundColor:
                              member.role === "ADMIN" ? "#10b981"
                              : member.role === "MANAGEMENT" ? "#fe13a8"
                              : "#f97316",
                          }}
                        >
                          {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{member.email}</td>
                    <td className="px-5 py-4 text-slate-600">{member.phone || "-"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          member.role === "ADMIN"
                            ? "bg-emerald-100 text-emerald-700"
                            : member.role === "MANAGEMENT"
                            ? "text-white"
                            : "bg-orange-100 text-orange-700"
                        )}
                        style={member.role === "MANAGEMENT" ? { backgroundColor: "#fe13a8" } : undefined}
                      >
                        {member.role === "ADMIN" ? (
                          <Shield className="w-3 h-3" />
                        ) : member.role === "MANAGEMENT" ? (
                          <Briefcase className="w-3 h-3" />
                        ) : (
                          <Wrench className="w-3 h-3" />
                        )}
                        {member.role === "ADMIN" ? "Admin" : member.role === "MANAGEMENT" ? "Management" : "Maintenance"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {currentUserRole !== "MANAGEMENT" && (
                          <button
                            onClick={() => { setResetModal({ email: member.email, name: member.name }); setNewPassword(""); setResetError(""); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Reset password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                        )}
                        {!(currentUserRole === "MANAGEMENT" && member.role === "ADMIN") && (
                          <button
                            onClick={() => handleDelete(member.id)}
                            disabled={deletingId === member.id}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                            title="Remove staff member"
                          >
                            {deletingId === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" /> Reset Password
              </h2>
              <button onClick={() => setResetModal(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Set a new password for <strong>{resetModal.name}</strong> ({resetModal.email})
              </p>
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{resetError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setResetModal(null)} className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword.trim() || resetting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {resetting ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Add Staff Member</h2>
              <button onClick={() => { setShowCreate(false); setError(""); }} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="MAINTENANCE">Maintenance Staff</option>
                  <option value="MANAGEMENT">Management</option>
                  {currentUserRole !== "MANAGEMENT" && (
                    <option value="ADMIN">Admin</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200">
              <button
                onClick={() => { setShowCreate(false); setError(""); }}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || !email.trim() || !password.trim() || creating}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Account
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
