import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      announcements.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        priority: a.priority,
        author: a.author,
        createdAt: a.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET announcements error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, priority, author } = body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        priority: priority || "normal",
        author: author || "Property Management",
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("POST announcement error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
