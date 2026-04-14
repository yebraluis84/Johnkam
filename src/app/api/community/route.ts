import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(
      posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category,
        authorId: p.authorId,
        authorName: p.authorName,
        unit: p.unit,
        pinned: p.pinned,
        likes: p.likes,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET community error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const post = await prisma.communityPost.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category || "general",
        authorId: body.authorId || null,
        authorName: body.authorName,
        unit: body.unit || null,
        pinned: body.pinned || false,
      },
    });
    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch (error) {
    console.error("POST community error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.communityPost.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH community error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.communityPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE community error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
