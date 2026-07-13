import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — candidate sends complaint/message/question
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { type, category, content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const interview = await prisma.recruiterInterview.findUnique({
      where: { shareToken: token },
      select: { id: true, status: true },
    });

    if (!interview || interview.status === "CANCELLED") {
      return NextResponse.json({ error: "Invalid interview" }, { status: 404 });
    }

    const message = await prisma.candidateInterviewMessage.create({
      data: {
        interviewId: interview.id,
        type: type || "MESSAGE",
        category: category || null,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Candidate chat POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// GET — recruiter fetches messages (called from detail page + monitor modal)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const interview = await prisma.recruiterInterview.findUnique({
      where: { shareToken: token },
      select: { id: true },
    });

    if (!interview) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await prisma.candidateInterviewMessage.findMany({
      where: { interviewId: interview.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Candidate chat GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH — recruiter marks message as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { messageId } = await req.json();

    await prisma.candidateInterviewMessage.update({
      where: { id: messageId },
      data: { read: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
