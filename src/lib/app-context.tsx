"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface TenantAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  balance: number;
  status: string;
  moveInDate: string;
  userId?: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location?: string;
  scheduledDate?: string;
  tenantId?: string;
  tenantName?: string;
  unit?: string;
  entryPermission?: string;
  createdAt: string;
  updatedAt?: string;
  comments: { id: string; message: string; author: string; role?: string; authorRole?: string; createdAt: string }[];
}

export interface VacantUnit {
  id: string;
  unit: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rent: number;
  availableDate: string;
  status: string;
  features: string[];
  lastTenant?: string;
  lastMoveOut?: string;
}

export interface PropertyInfo {
  id?: string;
  name: string;
  address: string;
  city: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalMonthlyRevenue: number;
  collectedThisMonth: number;
  pendingPayments: number;
  bankName?: string;
  bankAccountHolder?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
  zelleEmail?: string;
  paymentInstructions?: string;
}

interface AppState {
  tenants: TenantAccount[];
  tickets: MaintenanceTicket[];
  vacancies: VacantUnit[];
  property: PropertyInfo;
  loading: boolean;
  addTenant: (tenant: TenantAccount) => void;
  updateTenant: (id: string, data: Partial<TenantAccount>) => void;
  removeTenant: (id: string) => Promise<void>;
  addTicket: (ticket: MaintenanceTicket) => void;
  updateTicket: (id: string, data: Partial<MaintenanceTicket>) => void;
  addVacancy: (unit: VacantUnit) => void;
  updateVacancy: (id: string, data: Partial<VacantUnit>) => void;
  removeVacancy: (id: string) => void;
  updateProperty: (data: Partial<PropertyInfo>) => void;
  refreshData: () => void;
}

const defaultProperty: PropertyInfo = {
  name: "Maple Heights Residences",
  address: "1234 Maple Avenue",
  city: "Springfield, IL 62701",
  totalUnits: 24,
  occupiedUnits: 0,
  vacantUnits: 24,
  totalMonthlyRevenue: 0,
  collectedThisMonth: 0,
  pendingPayments: 0,
};

const AppContext = createContext<AppState | null>(null);

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<TenantAccount[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [vacancies, setVacancies] = useState<VacantUnit[]>([]);
  const [property, setProperty] = useState<PropertyInfo>(defaultProperty);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tenantsRes, ticketsRes, unitsRes, propertyRes] = await Promise.all([
        fetch("/api/tenants").then((r) => r.ok ? r.json() : []),
        fetch("/api/tickets").then((r) => r.ok ? r.json() : []),
        fetch("/api/units").then((r) => r.ok ? r.json() : []),
        fetch("/api/property").then((r) => r.ok ? r.json() : null),
      ]);

      setTenants(tenantsRes);
      setTickets(ticketsRes);

      // Map units to vacancy format for available/maintenance/reserved units
      const vacantUnits = unitsRes
        .filter((u: { status: string }) => u.status !== "occupied")
        .map((u: { id: string; number: string; floor: number; bedrooms: number; bathrooms: number; sqft: number; rent: number; availableDate: string; status: string; features: string[] }) => ({
          id: u.id,
          unit: u.number,
          floor: u.floor,
          bedrooms: u.bedrooms,
          bathrooms: u.bathrooms,
          sqft: u.sqft,
          rent: u.rent,
          availableDate: u.availableDate || new Date().toISOString().split("T")[0],
          status: u.status,
          features: u.features || [],
        }));
      setVacancies(vacantUnits);

      if (propertyRes && !propertyRes.error) {
        const occupiedCount = unitsRes.filter((u: { status: string }) => u.status === "occupied").length;
        const totalRent = tenantsRes.reduce((sum: number, t: { rentAmount: number }) => sum + (t.rentAmount || 0), 0);
        const totalBalance = tenantsRes.reduce((sum: number, t: { balance: number }) => sum + (t.balance || 0), 0);

        setProperty({
          id: propertyRes.id,
          name: propertyRes.name,
          address: propertyRes.address,
          city: propertyRes.city,
          totalUnits: propertyRes.totalUnits || unitsRes.length,
          occupiedUnits: occupiedCount,
          vacantUnits: (propertyRes.totalUnits || unitsRes.length) - occupiedCount,
          totalMonthlyRevenue: totalRent,
          collectedThisMonth: totalRent - totalBalance,
          pendingPayments: totalBalance,
        });
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTenant = useCallback(async (tenant: TenantAccount) => {
    // Optimistic update
    setTenants((prev) => [tenant, ...prev]);

    try {
      const nameParts = tenant.name.split(" ");
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
          email: tenant.email,
          phone: tenant.phone,
          unit: tenant.unit,
          rent: tenant.rentAmount,
          leaseStart: tenant.leaseStart,
          leaseEnd: tenant.leaseEnd,
          moveIn: tenant.moveInDate,
          sendInvite: true,
        }),
      });
      if (res.ok) {
        fetchData(); // Refresh to get real IDs
      }
    } catch (err) {
      console.error("Failed to add tenant:", err);
    }
  }, [fetchData]);

  const updateTenant = useCallback((id: string, data: Partial<TenantAccount>) => {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const removeTenant = useCallback(async (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tenants?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        // Small delay to let the database commit, then refresh
        await new Promise((r) => setTimeout(r, 500));
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to remove tenant:", err);
      fetchData(); // Revert by re-fetching
    }
  }, [fetchData]);

  const addTicket = useCallback(async (ticket: MaintenanceTicket) => {
    setTickets((prev) => [ticket, ...prev]);

    try {
      await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
          location: ticket.location,
          tenantId: ticket.tenantId,
          entryPermission: ticket.entryPermission,
        }),
      });
    } catch (err) {
      console.error("Failed to add ticket:", err);
    }
  }, []);

  const updateTicket = useCallback(async (id: string, data: Partial<MaintenanceTicket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));

    try {
      await fetch("/api/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: data.status }),
      });
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  }, []);

  const addVacancy = useCallback(async (unit: VacantUnit) => {
    setVacancies((prev) => [unit, ...prev]);

    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: unit.unit,
          floor: unit.floor,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          sqft: unit.sqft,
          rent: unit.rent,
          features: unit.features,
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to add unit:", err);
    }
  }, [fetchData]);

  const updateVacancy = useCallback((id: string, data: Partial<VacantUnit>) => {
    setVacancies((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  }, []);

  const removeVacancy = useCallback(async (id: string) => {
    setVacancies((prev) => prev.filter((u) => u.id !== id));

    try {
      await fetch(`/api/units?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to remove unit:", err);
    }
  }, []);

  const updateProperty = useCallback(async (data: Partial<PropertyInfo>) => {
    setProperty((prev) => ({ ...prev, ...data }));

    try {
      await fetch("/api/property", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: property.id, ...data }),
      });
    } catch (err) {
      console.error("Failed to update property:", err);
    }
  }, [property.id]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AppContext.Provider
      value={{
        tenants,
        tickets,
        vacancies,
        property,
        loading,
        addTenant,
        updateTenant,
        removeTenant,
        addTicket,
        updateTicket,
        addVacancy,
        updateVacancy,
        removeVacancy,
        updateProperty,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
