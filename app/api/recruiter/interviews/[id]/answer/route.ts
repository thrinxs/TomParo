import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreInterviewAnswer } from "@/lib/ai/interview-engine";

// ── Public — candidate submits answer via share link ───────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { questionId, answer, shareToken } = await req.json();

    if (!questionId || !answer?.trim()) {
      return NextResponse.json(
        { error: "Question ID and answer are required" },
        { status: 400 }
      );
    }

    // Verify interview exists and share token matches (for ASYNC mode)
    const interview = await prisma.recruiterInterview.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.status === "COMPLETED" || interview.status === "CANCELLED") {
      return NextResponse.json({ error: "This interview is no longer active" }, { status: 400 });
    }

    // For ASYNC mode, verify share token
    if (interview.mode === "ASYNC" && interview.shareToken !== shareToken) {
      return NextResponse.json({ error: "Invalid interview link" }, { status: 403 });
    }

    // Find the question
    const question = interview.questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.candidateAnswer) {
      return NextResponse.json({ error: "Question already answered" }, { status: 400 });
    }

    // ── AI scores the answer ──
    const { score, feedback } = await scoreInterviewAnswer({
      question: question.question,
      questionType: question.questionType,
      candidateAnswer: answer,
      jobTitle: interview.jobTitle || undefined,
      candidateName: interview.candidateName,
    });

    // ── Update question ──
    await prisma.recruiterInterviewQuestion.update({
      where: { id: questionId },
      data: {
        candidateAnswer: answer,
        aiScore: score,
        aiFeedback: feedback,
        answeredAt: new Date(),
      },
    });

    // ── Update interview answered count + status ──
    const answeredCount = interview.questions.filter(
      (q) => q.candidateAnswer || q.id === questionId
    ).length;

    await prisma.recruiterInterview.update({
      where: { id },
      data: {
        answeredQuestions: answeredCount,
        status: interview.status === "PENDING" ? "IN_PROGRESS" : interview.status,
        startedAt: interview.startedAt || new Date(),
      },
    });

    return NextResponse.json({ success: true, score, feedback });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
