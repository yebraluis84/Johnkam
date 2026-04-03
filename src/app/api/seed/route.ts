import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Check if already seeded
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@mapleheights.com" },
    });
    if (existingAdmin) {
      return NextResponse.json({ message: "Database already seeded" });
    }

    const passwordHash = await bcrypt.hash("admin2026", 10);
    const tenantHash = await bcrypt.hash("password123", 10);

    // Create property
    const property = await prisma.property.create({
      data: {
        name: "Maple Heights Residences",
        address: "1234 Maple Avenue",
        city: "Springfield, IL 62701",
        totalUnits: 24,
        paymentDueDay: 1,
        lateFeeGraceDays: 5,
        lateFeeAmount: 50,
      },
    });

    // Create units
    const unitData = [
      { number: "101", floor: 1, bedrooms: 1, bathrooms: 1, sqft: 650, rent: 1200, status: "OCCUPIED" as const },
      { number: "102", floor: 1, bedrooms: 2, bathrooms: 1, sqft: 850, rent: 1500, status: "OCCUPIED" as const },
      { number: "103", floor: 1, bedrooms: 1, bathrooms: 1, sqft: 650, rent: 1200, status: "OCCUPIED" as const },
      { number: "201", floor: 2, bedrooms: 2, bathrooms: 2, sqft: 950, rent: 1800, status: "OCCUPIED" as const },
      { number: "202", floor: 2, bedrooms: 3, bathrooms: 2, sqft: 1100, rent: 2200, status: "OCCUPIED" as const },
      { number: "203", floor: 2, bedrooms: 1, bathrooms: 1, sqft: 700, rent: 1300, status: "AVAILABLE" as const, features: ["Corner Unit", "City View"] },
      { number: "301", floor: 3, bedrooms: 2, bathrooms: 2, sqft: 1000, rent: 1900, status: "AVAILABLE" as const, features: ["Top Floor", "Balcony", "Mountain View"] },
      { number: "302", floor: 3, bedrooms: 3, bathrooms: 2, sqft: 1200, rent: 2400, status: "AVAILABLE" as const, features: ["Penthouse", "Rooftop Access"] },
    ];

    const units: Record<string, { id: string }> = {};
    for (const u of unitData) {
      const unit = await prisma.unit.create({
        data: { ...u, propertyId: property.id, features: u.features || [] },
      });
      units[u.number] = unit;
    }

    // Create admin user
    await prisma.user.create({
      data: {
        email: "admin@mapleheights.com",
        passwordHash,
        name: "Admin User",
        phone: "(555) 000-0001",
        role: "ADMIN",
      },
    });

    // Create tenant users and tenant records
    const tenantData = [
      { first: "Sarah", last: "Johnson", email: "sarah.johnson@email.com", phone: "(555) 123-4567", unit: "101", rent: 1200, status: "ACTIVE" as const },
      { first: "Michael", last: "Chen", email: "michael.chen@email.com", phone: "(555) 234-5678", unit: "102", rent: 1500, status: "ACTIVE" as const },
      { first: "Emily", last: "Rodriguez", email: "emily.rodriguez@email.com", phone: "(555) 345-6789", unit: "103", rent: 1200, status: "ACTIVE" as const },
      { first: "James", last: "Wilson", email: "james.wilson@email.com", phone: "(555) 456-7890", unit: "201", rent: 1800, status: "ACTIVE" as const },
      { first: "Lisa", last: "Park", email: "lisa.park@email.com", phone: "(555) 567-8901", unit: "202", rent: 2200, status: "PENDING" as const },
    ];

    const tenants: Record<string, { id: string }> = {};
    for (const t of tenantData) {
      const user = await prisma.user.create({
        data: {
          email: t.email,
          passwordHash: tenantHash,
          name: `${t.first} ${t.last}`,
          phone: t.phone,
          role: "TENANT",
        },
      });
      const tenant = await prisma.tenant.create({
        data: {
          userId: user.id,
          unitId: units[t.unit].id,
          leaseStart: new Date("2025-06-01"),
          leaseEnd: new Date("2026-05-31"),
          rentAmount: t.rent,
          balance: t.status === "ACTIVE" ? 0 : t.rent,
          status: t.status,
          moveInDate: new Date("2025-06-01"),
        },
      });
      tenants[t.email] = tenant;
    }

    // Create sample maintenance tickets
    const ticketData = [
      { title: "Leaky Kitchen Faucet", description: "The kitchen faucet has been dripping constantly.", category: "Plumbing", priority: "HIGH" as const, status: "IN_PROGRESS" as const, tenant: "sarah.johnson@email.com" },
      { title: "AC Not Cooling", description: "Air conditioner is running but not cooling the apartment.", category: "HVAC", priority: "URGENT" as const, status: "OPEN" as const, tenant: "michael.chen@email.com" },
      { title: "Broken Window Lock", description: "The lock on the bedroom window is broken.", category: "General", priority: "MEDIUM" as const, status: "SCHEDULED" as const, tenant: "emily.rodriguez@email.com" },
    ];

    for (let i = 0; i < ticketData.length; i++) {
      const t = ticketData[i];
      await prisma.maintenanceTicket.create({
        data: {
          ticketNumber: `MT-${String(i + 1).padStart(4, "0")}`,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          status: t.status,
          tenantId: tenants[t.tenant].id,
        },
      });
    }

    // Create sample payments
    const paymentData = [
      { amount: 1200, description: "March Rent", method: "CREDIT_CARD" as const, tenant: "sarah.johnson@email.com" },
      { amount: 1500, description: "March Rent", method: "ACH" as const, tenant: "michael.chen@email.com" },
      { amount: 1200, description: "March Rent", method: "CHECK" as const, tenant: "emily.rodriguez@email.com" },
      { amount: 1800, description: "March Rent", method: "CREDIT_CARD" as const, tenant: "james.wilson@email.com" },
    ];

    for (const p of paymentData) {
      await prisma.payment.create({
        data: {
          amount: p.amount,
          description: p.description,
          method: p.method,
          status: "COMPLETED",
          confirmationNumber: `PAY-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
          tenantId: tenants[p.tenant].id,
        },
      });
    }

    // Create sample announcements
    await prisma.announcement.createMany({
      data: [
        { title: "Pool Opening", message: "The community pool will open on June 1st. Hours: 8 AM - 10 PM daily.", priority: "normal", author: "Property Management" },
        { title: "Parking Lot Maintenance", message: "Parking lot will be re-striped on April 15th. Please move vehicles by 7 AM.", priority: "high", author: "Property Management" },
        { title: "Holiday Office Hours", message: "The management office will be closed on July 4th. Emergency maintenance line will remain active.", priority: "normal", author: "Property Management" },
      ],
    });

    return NextResponse.json({
      message: "Database seeded successfully",
      created: {
        property: 1,
        units: unitData.length,
        admin: 1,
        tenants: tenantData.length,
        tickets: ticketData.length,
        payments: paymentData.length,
        announcements: 3,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed", details: String(error) }, { status: 500 });
  }
}
