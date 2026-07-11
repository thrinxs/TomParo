"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, MessageSquare, Video, Zap,
  Loader2, Briefcase, User, CheckCircle, AlertTriangle, Mic, Type,
} from "lucide-react";
import toast from "react-hot-toast";

const interviewTypes = [
  {
    value: "TEXT",
    label: "Text",
    icon: Type,
    color: "indigo",
    description: "Candidate types their answers. Works on any device, any browser.",
    perks: ["✍️ Any device", "🌐 Any browser", "📝 Full control"],
  },
  {
    value: "VOICE",
    label: "Voice",
    icon: Mic,
    color: "violet",
    description: "Candidate speaks their answers. Browser transcribes speech to text in real time.",
    perks: ["🎙️ Speak naturally", "⚡ Real-time transcription", "🌐 Chrome & Edge"],
  },
  {
    value: "VIDEO",
    label: "Video",
    icon: Video,
    color: "pink",
    description: "Candidate records a short video answer per question. Most personal format.",
    perks: ["📹 Camera + mic", "👁️ Body language visible", "🎬 Recorded per question"],
  },
];

const colorMap: Record<string, { border: string; bg: string; icon: string; check: string; badge: string; badgeText: string }> = {
  indigo: {
    border: "border-indigo-500",
    bg: "bg-indigo-500/10",
    icon: "bg-indigo-500/20",
    check: "text-indigo-400",
    badge: "bg-indigo-500/20",
    badgeText: "text-indigo-400",
  },
  violet: {
    border: "border-violet-500",
    bg: "bg-violet-500/10",
    icon: "bg-violet-500/20",
    check: "text-violet-400",
    badge: "bg-violet-500/20",
    badgeText: "text-violet-400",
  },
  pink: {
    border: "border-pink-500",
    bg: "bg-pink-500/10",
    icon: "bg-pink-500/20",
    check: "text-pink-400",
    badge: "bg-pink-500/20",
    badgeText: "text-pink-400",
  },
};

function NewInterviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const candidateId = searchParams.get("candidateId") || "";
  const initialMode = (searchParams.get("mode") as "ASYNC" | "LIVE") || "ASYNC";
  const candidateName = searchParams.get("name") || "Candidate";

  const [mode, setMode] = useState<"ASYNC" | "LIVE">(initialMode);
  const [interviewType, setInterviewType] = useState<"TEXT" | "VOICE" | "VIDEO">("TEXT");
  const [candidate, setCandidate] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingCandidate, setLoadingCandidate] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`/api/recruiter/candidates/${candidateId}`);
        const data = await res.json();
        if (data.candidate) setCandidate(data.candidate);
      } catch {
        toast.error("Failed to load candidate");
      } finally {
        setLoadingCandidate(false);
      }
    };
    fetchCandidate();
  }, [candidateId]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/recruiter/jobs");
        const data = await res.json();
        if (data.jobs) {
          const active = data.jobs.filter((j: any) => j.status === "ACTIVE");
          setJobs(active);
          if (candidate?.job?.id) setSelectedJobId(candidate.job.id);
        }
      } catch {}
    };
    fetchJobs();
  }, [candidate]);

  const handleCreate = async () => {
    if (!candidateId) { toast.error("No candidate selected"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/recruiter/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          mode,
          interviewType,
          jobId: selectedJobId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Interview created! AI generated the questions.");
      router.push(`/recruiter/interviews/${data.interview.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create interview");
    } finally {
      setCreating(false);
    }
  };

  const analysis = candidate?.aiAnalysis
    ? (() => { try { return JSON.parse(candidate.aiAnalysis); } catch { return null; } })()
    : null;

  const selectedTypeConfig = interviewTypes.find((t) => t.value === interviewType)!;
  const selectedColor = colorMap[selectedTypeConfig.color];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">

      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link href="/recruiter/interviews" className="hover:text-white transition">Interviews</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">New Interview</span>
        </div>
        <Link href="/recruiter/interviews" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Interviews
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Start AI Interview</h1>
        <p className="text-slate-400 mt-1 text-sm">AI generates tailored questions and scores every answer.</p>
      </div>

      {/* Candidate card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Candidate</p>
        {loadingCandidate ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-white/5 animate-pulse" />
              <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        ) : candidate ? (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <span className="text-purple-400 font-bold text-sm">
                {(candidate.candidateName || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-white">{candidate.candidateName || "Unknown"}</h2>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                {candidate.candidateEmail && <span>{candidate.candidateEmail}</span>}
                {analysis?.totalExperienceYears != null && <span>{analysis.totalExperienceYears} yrs exp</span>}
                {analysis?.experienceLevel && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5">{analysis.experienceLevel}</span>
                )}
              </div>
              {candidate.atsScore != null && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-xs text-slate-400">ATS:</span>
                  <span className={`text-xs font-bold ${
                    candidate.atsScore >= 80 ? "text-emerald-400" : candidate.atsScore >= 60 ? "text-amber-400" : "text-red-400"
                  }`}>{candidate.atsScore}/100</span>
                  {analysis?.hiringRecommendation && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span className={`text-xs font-semibold ${
                        analysis.hiringRecommendation === "Strong Hire" ? "text-emerald-400"
                        : analysis.hiringRecommendation === "Hire" ? "text-blue-400"
                        : analysis.hiringRecommendation === "Maybe" ? "text-amber-400"
                        : "text-red-400"
                      }`}>{analysis.hiringRecommendation}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">Candidate not found. Please go back and try again.</p>
          </div>
        )}
      </div>

      {/* Interview Type picker */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Interview Type — How will the candidate answer?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {interviewTypes.map((type) => {
            const isSelected = interviewType === type.value;
            const colors = colorMap[type.color];
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setInterviewType(type.value as any)}
                className={`text-left rounded-2xl border p-4 transition ${
                  isSelected ? `${colors.border} ${colors.bg}` : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? colors.icon : "bg-white/5"
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? colors.check : "text-slate-500"}`} />
                  </div>
                  {isSelected && <CheckCircle className={`w-4 h-4 ${colors.check}`} />}
                </div>
                <p className={`text-sm font-semibold mb-1.5 ${isSelected ? "text-white" : "text-slate-300"}`}>
                  {type.label}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{type.description}</p>
                <div className="flex flex-col gap-0.5">
                  {type.perks.map((p) => (
                    <span key={p} className="text-[10px] text-slate-500">{p}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interview Mode picker */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interview Mode — Who's present?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setMode("ASYNC")}
            className={`text-left rounded-2xl border p-5 transition ${
              mode === "ASYNC" ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === "ASYNC" ? "bg-indigo-500/20" : "bg-white/5"}`}>
                <MessageSquare className={`w-5 h-5 ${mode === "ASYNC" ? "text-indigo-400" : "text-slate-500"}`} />
              </div>
              {mode === "ASYNC" && <CheckCircle className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <p className={`text-sm font-semibold ${mode === "ASYNC" ? "text-white" : "text-slate-300"}`}>Async</p>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 uppercase">Recommended</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidate answers on their own time via a private link. No scheduling needed.
            </p>
          </button>
          <button
            onClick={() => setMode("LIVE")}
            className={`text-left rounded-2xl border p-5 transition ${
              mode === "LIVE" ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === "LIVE" ? "bg-violet-500/20" : "bg-white/5"}`}>
                <Video className={`w-5 h-5 ${mode === "LIVE" ? "text-violet-400" : "text-slate-500"}`} />
              </div>
              {mode === "LIVE" && <CheckCircle className="w-4 h-4 text-violet-400" />}
            </div>
            <p className={`text-sm font-semibold mb-1 ${mode === "LIVE" ? "text-white" : "text-slate-300"}`}>Live</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              You conduct the interview in real time. AI scores answers as you go.
            </p>
          </button>
        </div>
      </div>

      {/* Job context */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Job Context <span className="ml-2 text-slate-600 normal-case font-normal">(optional but recommended)</span>
          </p>
          <p className="text-xs text-slate-500">Adds role-specific questions from the job description.</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedJobId("")}
            className={`w-full text-left rounded-xl border px-4 py-3 transition flex items-center justify-between ${
              selectedJobId === "" ? "border-purple-500/40 bg-purple-500/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <User className={`w-4 h-4 ${selectedJobId === "" ? "text-purple-400" : "text-slate-500"}`} />
              <span className={`text-sm ${selectedJobId === "" ? "text-white" : "text-slate-400"}`}>General — no specific job</span>
            </div>
            {selectedJobId === "" && <CheckCircle className="w-4 h-4 text-purple-400" />}
          </button>
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition flex items-center justify-between ${
                selectedJobId === job.id ? "border-purple-500/40 bg-purple-500/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Briefcase className={`w-4 h-4 shrink-0 ${selectedJobId === job.id ? "text-purple-400" : "text-slate-500"}`} />
                <div className="min-w-0">
                  <p className={`text-sm truncate ${selectedJobId === job.id ? "text-white" : "text-slate-300"}`}>{job.title}</p>
                  {job.location && <p className="text-xs text-slate-500 truncate">{job.location}</p>}
                </div>
              </div>
              {selectedJobId === job.id && <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Question sources */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Will Generate Questions From</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "CV Verification", desc: "Verify experience & claims", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Location Based", desc: "Relevant to candidate's region", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "Job Specific", desc: selectedJobId ? "From selected job description" : "General role questions", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            { label: "Behavioural", desc: "Culture fit & soft skills", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          ].map((q) => (
            <div key={q.label} className={`rounded-xl border ${q.border} ${q.bg} p-3`}>
              <p className={`text-xs font-semibold ${q.color} mb-0.5`}>{q.label}</p>
              <p className="text-[10px] text-slate-500">{q.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">
          8–10 questions · Per-answer AI scoring · Final summary + hire recommendation ·{" "}
          <span className={`font-semibold ${selectedColor.check}`}>{selectedTypeConfig.label} format</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/recruiter/interviews"
          className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-400 text-sm font-medium hover:text-white hover:bg-white/10 transition"
        >
          Cancel
        </Link>
        <button
          onClick={handleCreate}
          disabled={creating || !candidate || loadingCandidate}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
            interviewType === "VIDEO" ? "bg-pink-600 hover:bg-pink-500"
            : interviewType === "VOICE" ? "bg-violet-600 hover:bg-violet-500"
            : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {creating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Generating Questions...</>
          ) : (
            <><Zap className="w-4 h-4" />Create {interviewType.charAt(0) + interviewType.slice(1).toLowerCase()} Interview</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function NewInterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    }>
      <NewInterviewInner />
    </Suspense>
  );
}
