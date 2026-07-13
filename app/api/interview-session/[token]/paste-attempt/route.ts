import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const interview = await prisma.recruiterInterview.findUnique({
      where: { shareToken: token },
      select: { id: true },
    });

    if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.recruiterInterview.update({
      where: { id: interview.id },
      data: { pasteAttempts: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
