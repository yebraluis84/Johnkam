"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Save,
  Bell,
  Shield,
  Key,
} from "lucide-react";
import { currentTenant } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setUser({ name: stored.name || "", email: stored.email || "", phone: stored.phone || "" });
    } catch {}
  }, []);

  const nameParts = user.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tenant Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mx-auto">
            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mt-4">
            {user.name || "Loading..."}
          </h2>

          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{user.phone || "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <form
            onSubmit={handleSave}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">
                Personal Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue={firstName}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue={lastName}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue={user.phone}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  placeholder="Name and phone number"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          </form>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Payment reminders",
                  desc: "Get notified before rent is due",
                  defaultChecked: true,
                },
                {
                  label: "Maintenance updates",
                  desc: "Status changes on your requests",
                  defaultChecked: true,
                },
                {
                  label: "Announcements",
                  desc: "Community news and building updates",
                  defaultChecked: true,
                },
                {
                  label: "Lease renewal reminders",
                  desc: "Notifications about upcoming renewal",
                  defaultChecked: false,
                },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center justify-between py-2 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Security</h2>
            </div>

            <div className="space-y-4">
              <button className="flex items-center gap-3 w-full p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-left">
                <Key className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Change Password
                  </p>
                  <p className="text-xs text-slate-400">
                    Update your account password
                  </p>
                </div>
              </button>

              <button className="flex items-center gap-3 w-full p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-left">
                <Shield className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-slate-400">
                    Add extra security to your account
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
