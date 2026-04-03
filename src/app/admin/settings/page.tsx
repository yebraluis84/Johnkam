"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  Bell,
  CreditCard,
  Save,
  Users,
} from "lucide-react";
import { useAppState } from "@/lib/app-context";

export default function AdminSettingsPage() {
  const { property: propertyInfo, updateProperty } = useAppState();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("propName") as HTMLInputElement).value;
    const address = (form.elements.namedItem("propAddress") as HTMLInputElement).value;
    const city = (form.elements.namedItem("propCity") as HTMLInputElement).value;
    const totalUnits = parseInt((form.elements.namedItem("propUnits") as HTMLInputElement).value);
    updateProperty({ name, address, city, totalUnits });
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage property settings and preferences
        </p>
      </div>

      {/* Property Info */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Property Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Property Name
            </label>
            <input
              name="propName"
              type="text"
              defaultValue={propertyInfo.name}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Address
            </label>
            <input
              name="propAddress"
              type="text"
              defaultValue={propertyInfo.address}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                City, State, Zip
              </label>
              <input
                name="propCity"
                type="text"
                defaultValue={propertyInfo.city}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Total Units
              </label>
              <input
                name="propUnits"
                type="number"
                defaultValue={propertyInfo.totalUnits}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Payment Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Payment Due Day
              </label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
                <option>1st of the month</option>
                <option>5th of the month</option>
                <option>15th of the month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Late Fee Grace Period
              </label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
                <option>3 days</option>
                <option>5 days</option>
                <option>7 days</option>
                <option>10 days</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Late Fee Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  defaultValue="50"
                  className="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Accepted Payment Methods
              </label>
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600" />
                  <span className="text-sm text-slate-700">Credit/Debit Card</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600" />
                  <span className="text-sm text-slate-700">ACH Bank Transfer</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "New maintenance requests", desc: "Get notified when a tenant submits a ticket", defaultChecked: true },
            { label: "Payment received", desc: "Notification when a rent payment is processed", defaultChecked: true },
            { label: "Late payment alerts", desc: "Alert when a payment is past due", defaultChecked: true },
            { label: "Lease expiration reminders", desc: "Reminder 60/30/15 days before lease expires", defaultChecked: true },
            { label: "New tenant registration", desc: "When a tenant creates their account", defaultChecked: false },
          ].map((item) => (
            <label
              key={item.label}
              className="flex items-center justify-between py-2 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={item.defaultChecked}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Staff */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Staff Members</h2>
          </div>
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            + Invite Staff
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { name: "Mike Torres", email: "admin@mapleheights.com", role: "Property Manager" },
            { name: "Sarah Kim", email: "sarah.kim@mapleheights.com", role: "Maintenance Lead" },
            { name: "David Brown", email: "david.b@mapleheights.com", role: "Leasing Agent" },
          ].map((staff) => (
            <div key={staff.email} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                  {staff.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{staff.name}</p>
                  <p className="text-xs text-slate-400">{staff.email}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {staff.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
