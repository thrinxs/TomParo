"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import {
  MessageSquare, CheckCircle, Loader2, Send,
  Clock, Trophy, Star, ChevronRight, AlertTriangle,
} from "lucide-react";

const questionTypeLabels: Record<string, string> = {
  CV_VERIFICATION: "About Your Experience",
  LOCATION_BASED: "About Your Location",
  JOB_SPECIFIC: "About The Role",
  BEHAVIOURAL: "Behavioural",
};

const scoreColor = (score: number) =>
  score >= 8 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-red-400";

function InterviewSession() {
  const params = useParams();
  const token = params.token as string;

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justScored, setJustScored] = useState<{ score: number; feedback: string } | null>(null);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const res = await fetch(`/api/interview-session/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Interview not found");
          return;
        }
        setInterview(data.interview);
        // Find first unanswered question
        const firstUnanswered = data.interview.questions.findIndex((q: any) => !q.answered);
        setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      } catch {
        setError("Failed to load interview. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadInterview();
  }, [token]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    const question = interview.questions[currentIndex];
    setSubmitting(true);
    try {
      const res = await fetch(`/api/recruiter/interviews/${interview.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer,
          shareToken: token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setJustScored({ score: data.score, feedback: data.feedback });

      // Update local state
      setInterview((prev: any) => ({
        ...prev,
        answeredQuestions: prev.answeredQuestions + 1,
        questions: prev.questions.map((q: any, i: number) =>
          i === currentIndex
            ? { ...q, answered: true, aiScore: data.score, aiFeedback: data.feedback }
            : q
        ),
      }));

      setAnswer("");
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setJustScored(null);
    const nextUnanswered = interview.questions.findIndex(
      (q: any, i: number) => i > currentIndex && !q.answered
    );
    if (nextUnanswered !== -1) {
      setCurrentIndex(nextUnanswered);
    } else {
      // Find any remaining unanswered
      const anyUnanswered = interview.questions.findIndex((q: any) => !q.answered);
      if (anyUnanswered !== -1) setCurrentIndex(anyUnanswered);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2">Interview Error</p>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const allAnswered = interview.questions.every((q: any) => q.answered);
  const answeredCount = interview.questions.filter((q: any) => q.answered).length;
  const progress = Math.round((answeredCount / interview.totalQuestions) * 100);
  const currentQuestion = interview.questions[currentIndex];
  const avgScore = interview.questions
    .filter((q: any) => q.answered && q.aiScore != null)
    .reduce((sum: number, q: any) => sum + q.aiScore, 0) /
    (answeredCount || 1);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">AI Interview</p>
            <p className="text-white font-semibold">{interview.jobTitle || "Position"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{answeredCount} / {interview.totalQuestions}</p>
            <p className="text-white font-semibold text-sm">{progress}% complete</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Welcome header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Hi, {interview.candidateName}!
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Answer each question thoughtfully. AI will score your answers in real time.
            Take your time — there's no timer.
          </p>
        </div>

        {/* All answered — completion screen */}
        {allAnswered ? (
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Interview Complete! 🎉</h2>
              <p className="text-slate-400">
                You've answered all {interview.totalQuestions} questions. The recruiter will review your responses and be in touch soon.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-white font-semibold">
                Average Score: {avgScore.toFixed(1)}/10
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Current question */}
            {currentQuestion && !currentQuestion.answered && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {questionTypeLabels[currentQuestion.questionType] || currentQuestion.questionType}
                  </span>
                  <span className="text-xs text-slate-600">
                    Question {currentIndex + 1} of {interview.totalQuestions}
                  </span>
                </div>

                <p className="text-white text-lg font-medium leading-relaxed">
                  {currentQuestion.question}
                </p>

                {justScored ? (
                  <div className="space-y-4">
                    <div className={`text-center p-6 rounded-2xl border ${
                      justScored.score >= 8 ? "border-emerald-500/20 bg-emerald-500/5"
                      : justScored.score >= 5 ? "border-amber-500/20 bg-amber-500/5"
                      : "border-red-500/20 bg-red-500/5"
                    }`}>
                      <p className={`text-4xl font-bold ${scoreColor(justScored.score)} mb-1`}>
                        {justScored.score}/10
                      </p>
                      <p className="text-slate-400 text-sm">{justScored.feedback}</p>
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition"
                    >
                      Next Question <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={6}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition text-sm"
                    />
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answer.trim()}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Scoring your answer...</>
                      ) : (
                        <><Send className="w-4 h-4" />Submit Answer</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Questions overview */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
                All Questions
              </p>
              <div className="space-y-2">
                {interview.questions.map((q: any, i: number) => (
                  <div
                    key={q.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer ${
                      i === currentIndex && !q.answered
                        ? "bg-purple-500/10 border border-purple-500/20"
                        : q.answered
                        ? "bg-emerald-500/5 border border-emerald-500/10"
                        : "bg-white/[0.02] border border-white/5 hover:bg-white/5"
                    }`}
                    onClick={() => { if (!q.answered) { setCurrentIndex(i); setJustScored(null); } }}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      q.answered ? "bg-emerald-500/20 text-emerald-400"
                      : i === currentIndex ? "bg-purple-500/20 text-purple-400"
                      : "bg-white/5 text-slate-500"
                    }`}>
                      {q.answered ? "✓" : i + 1}
                    </div>
                    <p className="text-sm text-slate-300 truncate flex-1">{q.question}</p>
                    {q.answered && q.aiScore != null && (
                      <span className={`text-xs font-bold shrink-0 ${scoreColor(q.aiScore)}`}>
                        {q.aiScore}/10
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    }>
      <InterviewSession />
    </Suspense>
  );
}
