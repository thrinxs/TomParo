import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewSummary } from "@/lib/ai/interview-engine";
import { logActivity } from "@/lib/activity-log";

export async function POST(
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
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.status === "COMPLETED") {
      return NextResponse.json({ error: "Interview already completed" }, { status: 400 });
    }

    // ── Generate final summary ──
    const { summary, finalScore, finalRecommendation, strengths, concerns } =
      await generateInterviewSummary({
        candidateName: interview.candidateName,
        jobTitle: interview.jobTitle || undefined,
        questions: interview.questions.map((q) => ({
          question: q.question,
          questionType: q.questionType,
          candidateAnswer: q.candidateAnswer || undefined,
          aiScore: q.aiScore || undefined,
          aiFeedback: q.aiFeedback || undefined,
        })),
      });

    // ── Update interview ──
    const updatedInterview = await prisma.recruiterInterview.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        summary,
        finalScore,
        finalRecommendation,
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    await logActivity({
      recruiterId: profile.id,
      type: "CANDIDATE_STATUS_CHANGED",
      title: "Interview completed",
      description: `Interview for ${interview.candidateName} completed — ${finalRecommendation} (${finalScore}/100)`,
      meta: { candidateName: interview.candidateName, finalScore, finalRecommendation },
    });

    return NextResponse.json({
      success: true,
      interview: updatedInterview,
      summary,
      finalScore,
      finalRecommendation,
      strengths,
      concerns,
    });
  } catch (error) {
    console.error("Complete interview error:", error);
    return NextResponse.json({ error: "Failed to complete interview" }, { status: 500 });
  }
}
