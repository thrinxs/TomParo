import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Recruiter profile not found" }, { status: 404 });
    }

    const interview = await prisma.recruiterInterview.findFirst({
      where: { id, recruiterId: profile.id },
      include: {
        questions: { orderBy: { order: "asc" } },
        candidate: { select: { id: true, candidateName: true, candidateEmail: true, atsScore: true, aiAnalysis: true } },
        job: { select: { id: true, title: true } },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({ interview });
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json({ error: "Failed to load interview" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Recruiter profile not found" }, { status: 404 });
    }

    const interview = await prisma.recruiterInterview.findFirst({
      where: { id, recruiterId: profile.id },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    await prisma.recruiterInterview.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete interview error:", error);
    return NextResponse.json({ error: "Failed to delete interview" }, { status: 500 });
  }
}
