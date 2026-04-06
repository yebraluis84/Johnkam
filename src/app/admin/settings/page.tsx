"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Bell,
  CreditCard,
  Save,
  Users,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  Landmark,
} from "lucide-react";
import { useAppState } from "@/lib/app-context";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function AdminSettingsPage() {
  const { property: propertyInfo, updateProperty } = useAppState();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showBankAccount, setShowBankAccount] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) setStaff(await res.json());
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

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

  async function handleBankSave(e: React.FormEvent) {
    e.preventDefault();
    setBankSaving(true);
    const form = e.target as HTMLFormElement;
    const bankName = (form.elements.namedItem("bankName") as HTMLInputElement).value;
    const bankAccountHolder = (form.elements.namedItem("bankAccountHolder") as HTMLInputElement).value;
    const bankRoutingNumber = (form.elements.namedItem("bankRoutingNumber") as HTMLInputElement).value;
    const bankAccountNumber = (form.elements.namedItem("bankAccountNumber") as HTMLInputElement).value;
    const bankAccountType = (form.elements.namedItem("bankAccountType") as HTMLSelectElement).value;
    const zelleEmail = (form.elements.namedItem("zelleEmail") as HTMLInputElement).value;
    const paymentInstructions = (form.elements.namedItem("paymentInstructions") as HTMLTextAreaElement).value;

    try {
      await fetch("/api/property", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, bankAccountHolder, bankRoutingNumber, bankAccountNumber, bankAccountType, zelleEmail, paymentInstructions }),
      });
      setBankSaving(false);
      setBankSaved(true);
      setTimeout(() => setBankSaved(false), 3000);
    } catch {
      setBankSaving(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError("");

    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("staffName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("staffEmail") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("staffPhone") as HTMLInputElement).value;
    const role = (form.elements.namedItem("staffRole") as HTMLSelectElement).value;
    const password = (form.elements.namedItem("staffPassword") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStaffError(data.error || "Failed to add staff");
        setStaffLoading(false);
        return;
      }

      setShowAddStaff(false);
      form.reset();
      await fetchStaff();
    } catch {
      setStaffError("Connection error");
    }
    setStaffLoading(false);
  }

  async function handleRemoveStaff(id: string, name: string) {
    if (!confirm(`Remove ${name} from staff?`)) return;

    try {
      const res = await fetch(`/api/staff?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await new Promise((r) => setTimeout(r, 300));
        await fetchStaff();
      }
    } catch (err) {
      console.error("Failed to remove staff:", err);
    }
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Property Manager",
    MAINTENANCE: "Maintenance Staff",
  };

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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Due Day</label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
                <option>1st of the month</option>
                <option>5th of the month</option>
                <option>15th of the month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Late Fee Grace Period</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Late Fee Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input type="number" defaultValue="50" className="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Accepted Payment Methods</label>
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

      {/* Bank Account Settings */}
      <form
        onSubmit={handleBankSave}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Landmark className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Bank Account for Receiving Payments</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          This information will be shown to tenants so they can send rent payments to your account.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Name</label>
              <input
                name="bankName"
                type="text"
                defaultValue={propertyInfo.bankName || ""}
                placeholder="e.g. Chase, Bank of America"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Holder Name</label>
              <input
                name="bankAccountHolder"
                type="text"
                defaultValue={propertyInfo.bankAccountHolder || ""}
                placeholder="Name on the account"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Routing Number</label>
              <div className="relative">
                <input
                  name="bankRoutingNumber"
                  type={showBankAccount ? "text" : "password"}
                  defaultValue={propertyInfo.bankRoutingNumber || ""}
                  placeholder="9-digit routing number"
                  maxLength={9}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none pr-10"
                />
                <button type="button" onClick={() => setShowBankAccount(!showBankAccount)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showBankAccount ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
              <input
                name="bankAccountNumber"
                type={showBankAccount ? "text" : "password"}
                defaultValue={propertyInfo.bankAccountNumber || ""}
                placeholder="Account number"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Type</label>
              <select
                name="bankAccountType"
                defaultValue={propertyInfo.bankAccountType || "checking"}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Zelle Email / Phone (optional)</label>
              <input
                name="zelleEmail"
                type="text"
                defaultValue={propertyInfo.zelleEmail || ""}
                placeholder="Zelle-registered email or phone"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Instructions for Tenants (optional)</label>
            <textarea
              name="paymentInstructions"
              rows={3}
              defaultValue={propertyInfo.paymentInstructions || ""}
              placeholder="e.g. Please include your unit number as memo when sending payment..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={bankSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {bankSaving ? "Saving..." : bankSaved ? "Saved!" : "Save Bank Info"}
            </button>
          </div>
        </div>
      </form>

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
            <label key={item.label} className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500" />
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
          <button
            onClick={() => setShowAddStaff(true)}
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {/* Add Staff Form */}
        {showAddStaff && (
          <form onSubmit={handleAddStaff} className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">New Staff Member</h3>
              <button type="button" onClick={() => { setShowAddStaff(false); setStaffError(""); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            {staffError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{staffError}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="staffName" type="text" required placeholder="Full Name" className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              <input name="staffEmail" type="email" required placeholder="Email Address" className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="staffPhone" type="tel" placeholder="Phone (optional)" className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              <select name="staffRole" className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white appearance-none">
                <option value="ADMIN">Property Manager</option>
                <option value="MAINTENANCE">Maintenance Staff</option>
              </select>
            </div>
            <div className="relative">
              <input name="staffPassword" type={showPassword ? "text" : "password"} required minLength={6} placeholder="Password (min 6 characters)" className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowAddStaff(false); setStaffError(""); }} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
              <button type="submit" disabled={staffLoading} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50">
                {staffLoading ? "Adding..." : "Add Staff"}
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-100">
          {staff.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">No staff members yet. Click &quot;Add Staff&quot; to get started.</p>
          )}
          {staff.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {roleLabels[member.role] || member.role}
                </span>
                <button
                  onClick={() => handleRemoveStaff(member.id, member.name)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  title="Remove staff"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
