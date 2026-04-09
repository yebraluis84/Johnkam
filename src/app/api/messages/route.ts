import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET conversations + messages for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Get conversations this user is part of
    const conversations = await prisma.conversation.findMany({
      where: { participants: { has: userId } },
      orderBy: { updatedAt: "desc" },
    });

    // Get messages and unread counts for each conversation
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await prisma.message.findMany({
          where: { conversationId: conv.id },
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        });

        const unread = messages.filter(
          (m) => m.senderId !== userId && !m.read
        ).length;

        const lastMsg = messages[messages.length - 1];

        // Get participant names
        const participantUsers = await prisma.user.findMany({
          where: { id: { in: conv.participants } },
          select: { id: true, name: true, role: true },
        });

        return {
          id: conv.id,
          subject: conv.subject,
          participants: participantUsers.map((u) => ({
            id: u.id,
            name: u.name,
            role: u.role,
          })),
          messages: messages.map((m) => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            senderName: m.sender.name,
            senderRole: m.sender.role,
            read: m.read,
            createdAt: m.createdAt.toISOString(),
          })),
          unread,
          lastMessage: lastMsg?.content || "",
          lastMessageAt: lastMsg?.createdAt.toISOString() || conv.updatedAt.toISOString(),
          updatedAt: conv.updatedAt.toISOString(),
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST send a message (create conversation if needed)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, recipientId, conversationId, subject, content } = body;

    if (!senderId || !content) {
      return NextResponse.json(
        { error: "senderId and content required" },
        { status: 400 }
      );
    }

    let convId = conversationId;

    // Create new conversation if no conversationId
    if (!convId) {
      if (!recipientId || !subject) {
        return NextResponse.json(
          { error: "recipientId and subject required for new conversation" },
          { status: 400 }
        );
      }

      const conv = await prisma.conversation.create({
        data: {
          subject,
          participants: [senderId, recipientId],
        },
      });
      convId = conv.id;
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: convId,
        senderId,
        content,
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        id: message.id,
        conversationId: convId,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        senderRole: message.sender.role,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH mark messages as read
export async function PATCH(req: NextRequest) {
  try {
    const { conversationId, userId } = await req.json();

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "conversationId and userId required" },
        { status: 400 }
      );
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH messages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
