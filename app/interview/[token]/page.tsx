"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import {
  MessageSquare, CheckCircle, Loader2, Send,
  Star, ChevronRight, AlertTriangle,
  Mic, MicOff, Type,
} from "lucide-react";

const questionTypeLabels: Record<string, string> = {
  CV_VERIFICATION: "About Your Experience",
  LOCATION_BASED: "About Your Location",
  JOB_SPECIFIC: "About The Role",
  BEHAVIOURAL: "Behavioural",
};

const scoreColor = (score: number) =>
  score >= 8 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-red-400";

function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startRecording = (onFinalTranscript: (text: string) => void) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      if (final) onFinalTranscript(final);
      setInterimText(interim);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setInterimText("");
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setInterimText("");
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterimText("");
  };

  return { isRecording, isSupported, interimText, startRecording, stopRecording };
}

function MicButton({
  isRecording,
  isSupported,
  onToggle,
}: {
  isRecording: boolean;
  isSupported: boolean;
  onToggle: () => void;
}) {
  if (!isSupported) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isRecording ? "Stop recording" : "Answer with voice"}
      className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
        isRecording
          ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
          : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {isRecording ? (
        <>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <MicOff className="w-4 h-4" />
          Stop
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          Voice
        </>
      )}
    </button>
  );
}

function InterviewSession() {
  const params = useParams();
  const token = params.token as string;

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answerMode, setAnswerMode] = useState<"text" | "voice">("text");
  const [submitting, setSubmitting] = useState(false);
  const [justScored, setJustScored] = useState<{ score: number; feedback: string } | null>(null);

  const { isRecording, isSupported, interimText, startRecording, stopRecording } =
    useSpeechRecognition();

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

  useEffect(() => {
    if (isRecording) stopRecording();
    setAnswer("");
    setAnswerMode("text");
  }, [currentIndex]);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setAnswerMode("voice");
      startRecording((finalText) => {
        setAnswer((prev) => prev + finalText);
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    if (isRecording) stopRecording();
    const question = interview.questions[currentIndex];
    setSubmitting(true);
    try {
      const res = await fetch(`/api/recruiter/interviews/${interview.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer: answer.trim(),
          shareToken: token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setJustScored({ score: data.score, feedback: data.feedback });
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
      setAnswerMode("text");
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
  const avgScore =
    interview.questions
      .filter((q: any) => q.answered && q.aiScore != null)
      .reduce((sum: number, q: any) => sum + q.aiScore, 0) / (answeredCount || 1);

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
        <div className="h-1 bg-white/5">
          <div
            className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Welcome */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Hi, {interview.candidateName}!
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Answer each question by typing or using your voice. AI scores your answers in real time.
            Take your time — there's no timer.
          </p>
          {isSupported && (
            <p className="text-xs text-indigo-400 mt-2 flex items-center justify-center gap-1.5">
              <Mic className="w-3 h-3" />
              Voice answering is available — click the Voice button on any question
            </p>
          )}
        </div>

        {/* All answered */}
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
                      justScored.score >= 8
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : justScored.score >= 5
                        ? "border-amber-500/20 bg-amber-500/5"
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
                  <div className="space-y-3">

                    {/* Answer mode toggle */}
                    {isSupported && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { stopRecording(); setAnswerMode("text"); }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            answerMode === "text"
                              ? "bg-white/10 text-white"
                              : "text-slate-500 hover:text-white"
                          }`}
                        >
                          <Type className="w-3.5 h-3.5" /> Type
                        </button>
                        <button
                          onClick={() => setAnswerMode("voice")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            answerMode === "voice"
                              ? "bg-white/10 text-white"
                              : "text-slate-500 hover:text-white"
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" /> Voice
                        </button>
                      </div>
                    )}

                    {/* Text mode */}
                    {answerMode === "text" && (
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={6}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition text-sm"
                      />
                    )}

                    {/* Voice mode */}
                    {answerMode === "voice" && (
                      <div className="space-y-3">
                        <div className={`relative rounded-xl border px-4 py-4 min-h-[9rem] transition ${
                          isRecording
                            ? "border-red-500/40 bg-red-500/5"
                            : "border-white/10 bg-slate-900/50"
                        }`}>
                          {(answer || interimText) ? (
                            <p className="text-sm leading-relaxed">
                              <span className="text-white">{answer}</span>
                              {interimText && (
                                <span className="text-slate-500">{interimText}</span>
                              )}
                            </p>
                          ) : (
                            <p className="text-slate-500 text-sm">
                              {isRecording
                                ? "Listening... speak clearly into your microphone"
                                : "Press the microphone button and start speaking"}
                            </p>
                          )}
                          {isRecording && (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                              </span>
                              <span className="text-[10px] text-red-400 font-medium uppercase tracking-wide">
                                Recording
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <MicButton
                            isRecording={isRecording}
                            isSupported={isSupported}
                            onToggle={handleToggleRecording}
                          />
                          {answer && !isRecording && (
                            <button
                              onClick={() => setAnswer("")}
                              className="px-3 py-2.5 rounded-xl text-xs text-slate-500 hover:text-white border border-white/5 hover:border-white/10 transition"
                            >
                              Clear
                            </button>
                          )}
                          {answer && (
                            <p className="text-xs text-slate-500 ml-auto">
                              {answer.split(" ").filter(Boolean).length} words captured
                            </p>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-600 flex items-center gap-1">
                          💡 Works best in Chrome or Edge · Allow microphone access when prompted
                        </p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answer.trim() || isRecording}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Scoring your answer...</>
                      ) : isRecording ? (
                        <><MicOff className="w-4 h-4" />Stop recording first</>
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
                    onClick={() => {
                      if (!q.answered) {
                        if (isRecording) stopRecording();
                        setCurrentIndex(i);
                        setJustScored(null);
                      }
                    }}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      q.answered
                        ? "bg-emerald-500/20 text-emerald-400"
                        : i === currentIndex
                        ? "bg-purple-500/20 text-purple-400"
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
