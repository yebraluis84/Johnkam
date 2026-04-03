"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { TenantAccount, tenantAccounts as initialTenants, propertyInfo as initialProperty } from "@/lib/admin-data";
import { MaintenanceTicket, maintenanceTickets as initialTickets } from "@/lib/mock-data";
import { VacantUnit, vacantUnits as initialVacancies } from "@/lib/extended-data";

export interface PropertyInfo {
  name: string;
  address: string;
  city: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalMonthlyRevenue: number;
  collectedThisMonth: number;
  pendingPayments: number;
}

interface AppState {
  tenants: TenantAccount[];
  tickets: MaintenanceTicket[];
  vacancies: VacantUnit[];
  property: PropertyInfo;
  addTenant: (tenant: TenantAccount) => void;
  updateTenant: (id: string, data: Partial<TenantAccount>) => void;
  removeTenant: (id: string) => void;
  addTicket: (ticket: MaintenanceTicket) => void;
  updateTicket: (id: string, data: Partial<MaintenanceTicket>) => void;
  addVacancy: (unit: VacantUnit) => void;
  updateVacancy: (id: string, data: Partial<VacantUnit>) => void;
  removeVacancy: (id: string) => void;
  updateProperty: (data: Partial<PropertyInfo>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<TenantAccount[]>(initialTenants);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialTickets);
  const [vacancies, setVacancies] = useState<VacantUnit[]>(initialVacancies);
  const [property, setProperty] = useState<PropertyInfo>(initialProperty);

  const addTenant = useCallback((tenant: TenantAccount) => {
    setTenants((prev) => [tenant, ...prev]);
  }, []);

  const updateTenant = useCallback((id: string, data: Partial<TenantAccount>) => {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const removeTenant = useCallback((id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addTicket = useCallback((ticket: MaintenanceTicket) => {
    setTickets((prev) => [ticket, ...prev]);
  }, []);

  const updateTicket = useCallback((id: string, data: Partial<MaintenanceTicket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const addVacancy = useCallback((unit: VacantUnit) => {
    setVacancies((prev) => [unit, ...prev]);
  }, []);

  const updateVacancy = useCallback((id: string, data: Partial<VacantUnit>) => {
    setVacancies((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  }, []);

  const removeVacancy = useCallback((id: string) => {
    setVacancies((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const updateProperty = useCallback((data: Partial<PropertyInfo>) => {
    setProperty((prev) => ({ ...prev, ...data }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        tenants,
        tickets,
        vacancies,
        property,
        addTenant,
        updateTenant,
        removeTenant,
        addTicket,
        updateTicket,
        addVacancy,
        updateVacancy,
        removeVacancy,
        updateProperty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
