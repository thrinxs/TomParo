"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, MessageSquare, Video, Zap,
  Loader2, Briefcase, User, CheckCircle, XCircle,
  AlertTriangle, Users, ChevronDown, ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

function BulkInterviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawIds = searchParams.get("ids") || "";
  const candidateIds = rawIds.split(",").filter(Boolean);
  const initialMode = (searchParams.get("mode") as "ASYNC" | "LIVE") || "ASYNC";

  const [mode, setMode] = useState<"ASYNC" | "LIVE">(initialMode);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [showCandidateList, setShowCandidateList] = useState(false);

  // Creating state
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0); // how many done
  const [results, setResults] = useState<
    { candidateId: string; candidateName: string; success: boolean; interviewId?: string; error?: string }[]
  >([]);
  const [done, setDone] = useState(false);

  // Fetch all candidates
  useEffect(() => {
    if (candidateIds.length === 0) return;
    const fetchAll = async () => {
      try {
        const settled = await Promise.allSettled(
          candidateIds.map((id) =>
            fetch(`/api/recruiter/candidates/${id}`).then((r) => r.json())
          )
        );
        const loaded = settled
          .map((r) => (r.status === "fulfilled" ? r.value.candidate : null))
          .filter(Boolean);
        setCandidates(loaded);
      } catch {
        toast.error("Failed to load candidates");
      } finally {
        setLoadingCandidates(false);
      }
    };
    fetchAll();
  }, [rawIds]);

  // Fetch active jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/recruiter/jobs");
        const data = await res.json();
        if (data.jobs) setJobs(data.jobs.filter((j: any) => j.status === "ACTIVE"));
      } catch {}
    };
    fetchJobs();
  }, []);

  // Guard — no candidates
  if (!loadingCandidates && candidateIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white">No candidates selected</h2>
        <p className="text-slate-400 text-sm">Go back to the candidates page and select candidates first.</p>
        <Link
          href="/recruiter/candidates"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidates
        </Link>
      </div>
    );
  }

  const handleCreate = async () => {
    if (candidates.length === 0) {
      toast.error("No candidates to interview");
      return;
    }

    setCreating(true);
    setProgress(0);
    setResults([]);

    const resultsList: typeof results = [];

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      try {
        const res = await fetch("/api/recruiter/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: candidate.id,
            mode,
            jobId: selectedJobId || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        resultsList.push({
          candidateId: candidate.id,
          candidateName: candidate.candidateName || "Unknown",
          success: true,
          interviewId: data.interview.id,
        });
      } catch (err: any) {
        resultsList.push({
          candidateId: candidate.id,
          candidateName: candidate.candidateName || "Unknown",
          success: false,
          error: err.message || "Failed to create",
        });
      }
      setProgress(i + 1);
      setResults([...resultsList]);
    }

    setCreating(false);
    setDone(true);

    const successful = resultsList.filter((r) => r.success).length;
    const failed = resultsList.filter((r) => !r.success).length;

    if (successful > 0 && failed === 0) {
      toast.success(`${successful} interview${successful !== 1 ? "s" : ""} created!`);
    } else if (successful > 0 && failed > 0) {
      toast.success(`${successful} created · ${failed} failed`);
    } else {
      toast.error("All interviews failed to create");
    }
  };

  const progressPercent =
    candidates.length > 0 ? Math.round((progress / candidates.length) * 100) : 0;

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">

      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link href="/recruiter/interviews" className="hover:text-white transition">
            Interviews
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">Bulk Interview</span>
        </div>
        <Link
          href="/recruiter/candidates"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidates
        </Link>
      </div>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Bulk AI Interviews</h1>
        <p className="text-slate-400 mt-1 text-sm">
          AI will generate tailored questions for each candidate individually.
        </p>
      </div>

      {/* ── RESULTS VIEW (after done) ── */}
      {done && (
        <div className="space-y-4">

          {/* Summary banner */}
          <div className={`rounded-3xl border p-6 ${
            failCount === 0
              ? "border-emerald-500/20 bg-emerald-500/5"
              : successCount === 0
              ? "border-red-500/20 bg-red-500/5"
              : "border-amber-500/20 bg-amber-500/5"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {failCount === 0 ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : successCount === 0 ? (
                <XCircle className="w-6 h-6 text-red-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
              <h2 className="text-lg font-bold text-white">
                {failCount === 0
                  ? "All interviews created!"
                  : successCount === 0
                  ? "All interviews failed"
                  : "Partially completed"}
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              {successCount > 0 && (
                <span className="text-emerald-400 font-semibold">{successCount} created </span>
              )}
              {failCount > 0 && (
                <span className="text-red-400 font-semibold">{failCount} failed</span>
              )}
            </p>
          </div>

          {/* Per-candidate results */}
          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.candidateId}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${
                  r.success
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {r.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span className={`text-sm font-medium truncate ${r.success ? "text-white" : "text-red-300"}`}>
                    {r.candidateName}
                  </span>
                </div>
                <div className="shrink-0">
                  {r.success && r.interviewId ? (
                    <Link
                      href={`/recruiter/interviews/${r.interviewId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-xs text-red-400">{r.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Go to interviews */}
          <Link
            href="/recruiter/interviews"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition"
          >
            View All Interviews <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── CREATION IN PROGRESS VIEW ── */}
      {creating && (
        <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-8 space-y-5">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            <p className="text-sm font-semibold text-white">
              Creating interviews... {progress} of {candidates.length}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-white/5">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 text-right">{progressPercent}%</p>
          </div>

          {/* Live results as they come in */}
          {results.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.map((r) => (
                <div
                  key={r.candidateId}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                    r.success
                      ? "bg-emerald-500/5 border border-emerald-500/20"
                      : "bg-red-500/5 border border-red-500/20"
                  }`}
                >
                  {r.success ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className={r.success ? "text-emerald-400" : "text-red-400"}>
                    {r.candidateName}
                  </span>
                  {!r.success && r.error && (
                    <span className="text-red-500 ml-auto">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SETUP VIEW (before creating) ── */}
      {!creating && !done && (
        <>
          {/* Selected candidates summary */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {loadingCandidates ? "Loading..." : `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""} selected`}
                  </p>
                  <p className="text-xs text-slate-500">AI generates unique questions for each one</p>
                </div>
              </div>

              {/* Toggle list */}
              {!loadingCandidates && candidates.length > 0 && (
                <button
                  onClick={() => setShowCandidateList(!showCandidateList)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 text-xs font-medium hover:text-white hover:bg-white/10 transition"
                >
                  {showCandidateList ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> Show all</>
                  )}
                </button>
              )}
            </div>

            {/* Candidate list (collapsible) */}
            {showCandidateList && (
              <div className="space-y-2 pt-2 border-t border-white/5 max-h-64 overflow-y-auto">
                {loadingCandidates ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-white/5" />
                        <div className="h-3 w-40 rounded bg-white/5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  candidates.map((c) => {
                    const analysis = c.aiAnalysis ? (() => { try { return JSON.parse(c.aiAnalysis); } catch { return null; } })() : null;
                    return (
                      <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                          <span className="text-purple-400 font-bold text-[10px]">
                            {(c.candidateName || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{c.candidateName || "Unknown"}</p>
                          {c.candidateEmail && (
                            <p className="text-[10px] text-slate-500 truncate">{c.candidateEmail}</p>
                          )}
                        </div>
                        {c.atsScore != null && (
                          <span className={`text-xs font-bold shrink-0 ${
                            c.atsScore >= 80 ? "text-emerald-400"
                            : c.atsScore >= 60 ? "text-amber-400"
                            : "text-red-400"
                          }`}>
                            {c.atsScore}/100
                          </span>
                        )}
                        {analysis?.hiringRecommendation && (
                          <span className={`text-[10px] font-semibold shrink-0 ${
                            analysis.hiringRecommendation === "Strong Hire" ? "text-emerald-400"
                            : analysis.hiringRecommendation === "Hire" ? "text-blue-400"
                            : analysis.hiringRecommendation === "Maybe" ? "text-amber-400"
                            : "text-red-400"
                          }`}>
                            {analysis.hiringRecommendation}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Mode picker */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Interview Mode
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* ASYNC */}
              <button
                onClick={() => setMode("ASYNC")}
                className={`text-left rounded-2xl border p-5 transition ${
                  mode === "ASYNC"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mode === "ASYNC" ? "bg-indigo-500/20" : "bg-white/5"
                  }`}>
                    <MessageSquare className={`w-5 h-5 ${mode === "ASYNC" ? "text-indigo-400" : "text-slate-500"}`} />
                  </div>
                  {mode === "ASYNC" && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-semibold ${mode === "ASYNC" ? "text-white" : "text-slate-300"}`}>
                    Async
                  </p>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 uppercase tracking-wide">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Each candidate gets a private link. They answer on their own time.
                </p>
                <div className="mt-3 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">⏱ No scheduling needed</span>
                  <span className="text-[10px] text-slate-500">🔗 Unique link per candidate</span>
                  <span className="text-[10px] text-slate-500">📊 AI scores every answer</span>
                </div>
              </button>

              {/* LIVE */}
              <button
                onClick={() => setMode("LIVE")}
                className={`text-left rounded-2xl border p-5 transition ${
                  mode === "LIVE"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mode === "LIVE" ? "bg-violet-500/20" : "bg-white/5"
                  }`}>
                    <Video className={`w-5 h-5 ${mode === "LIVE" ? "text-violet-400" : "text-slate-500"}`} />
                  </div>
                  {mode === "LIVE" && <CheckCircle className="w-4 h-4 text-violet-400" />}
                </div>
                <p className={`text-sm font-semibold mb-1 ${mode === "LIVE" ? "text-white" : "text-slate-300"}`}>
                  Live
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You conduct each interview in real time with AI assistance.
                </p>
                <div className="mt-3 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">🎙 Real-time AI scoring</span>
                  <span className="text-[10px] text-slate-500">📝 Final AI summary per candidate</span>
                  <span className="text-[10px] text-slate-500">👤 Recruiter present</span>
                </div>
              </button>
            </div>
          </div>

          {/* Job context */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Job Context
                <span className="ml-2 text-slate-600 normal-case font-normal">(optional but recommended)</span>
              </p>
              <p className="text-xs text-slate-500">
                Selecting a job adds role-specific questions for every candidate in this batch.
              </p>
            </div>

            {jobs.length > 0 ? (
              <div className="space-y-2">
                {/* No job option */}
                <button
                  onClick={() => setSelectedJobId("")}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition flex items-center justify-between ${
                    selectedJobId === ""
                      ? "border-purple-500/40 bg-purple-500/5"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className={`w-4 h-4 ${selectedJobId === "" ? "text-purple-400" : "text-slate-500"}`} />
                    <span className={`text-sm ${selectedJobId === "" ? "text-white" : "text-slate-400"}`}>
                      General interview — no specific job
                    </span>
                  </div>
                  {selectedJobId === "" && <CheckCircle className="w-4 h-4 text-purple-400" />}
                </button>

                {/* Job options */}
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition flex items-center justify-between ${
                      selectedJobId === job.id
                        ? "border-purple-500/40 bg-purple-500/5"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Briefcase className={`w-4 h-4 shrink-0 ${selectedJobId === job.id ? "text-purple-400" : "text-slate-500"}`} />
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${selectedJobId === job.id ? "text-white" : "text-slate-300"}`}>
                          {job.title}
                        </p>
                        {job.location && (
                          <p className="text-xs text-slate-500 truncate">{job.location}</p>
                        )}
                      </div>
                    </div>
                    {selectedJobId === job.id && (
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" />
                No active jobs found — interviews will use general questions
              </p>
            )}
          </div>

          {/* What AI generates */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              AI Will Generate Questions From
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "CV Verification", desc: "Verify each candidate's experience", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { label: "Location Based", desc: "Relevant to each candidate's region", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
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
              8–10 questions per candidate · Unique questions for each CV · Per-answer AI scoring
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link
              href="/recruiter/candidates"
              className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-400 text-sm font-medium hover:text-white hover:bg-white/10 transition"
            >
              Cancel
            </Link>
            <button
              onClick={handleCreate}
              disabled={creating || loadingCandidates || candidates.length === 0}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === "LIVE"
                  ? "bg-violet-600 hover:bg-violet-500"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Interview {candidates.length} Candidate{candidates.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function BulkInterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    }>
      <BulkInterviewInner />
    </Suspense>
  );
}