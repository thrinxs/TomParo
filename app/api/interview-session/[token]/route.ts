import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Public — candidate loads their interview via share token ───────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const interview = await prisma.recruiterInterview.findUnique({
      where: { shareToken: token },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.status === "CANCELLED") {
      return NextResponse.json({ error: "This interview has been cancelled" }, { status: 400 });
    }

    // Return interview without sensitive recruiter data
    return NextResponse.json({
      interview: {
        id: interview.id,
        shareToken: interview.shareToken,
        candidateName: interview.candidateName,
        jobTitle: interview.jobTitle,
        status: interview.status,
        mode: interview.mode,
        totalQuestions: interview.totalQuestions,
        answeredQuestions: interview.answeredQuestions,
        completedAt: interview.completedAt,
        questions: interview.questions.map((q) => ({
          id: q.id,
          question: q.question,
          questionType: q.questionType,
          order: q.order,
          answered: !!q.candidateAnswer,
          aiScore: q.candidateAnswer ? q.aiScore : null,
          aiFeedback: q.candidateAnswer ? q.aiFeedback : null,
        })),
      },
    });
  } catch (error) {
    console.error("Load interview session error:", error);
    return NextResponse.json({ error: "Failed to load interview" }, { status: 500 });
  }
}
