"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare, Clock, CheckCircle, XCircle, Loader2,
  Plus, Search, ArrowRight, Lock, Users, Briefcase,
  AlertTriangle, Trophy, Star,
} from "lucide-react";
import toast from "react-hot-toast";

const statusConfig = {
  PENDING: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: MessageSquare },
  COMPLETED: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: XCircle },
};

const recommendationConfig: Record<string, { color: string; icon: any }> = {
  "Strong Hire": { color: "text-emerald-400", icon: Trophy },
  "Hire": { color: "text-blue-400", icon: CheckCircle },
  "Maybe": { color: "text-amber-400", icon: AlertTriangle },
  "No Hire": { color: "text-red-400", icon: XCircle },
};

const modeConfig = {
  ASYNC: { label: "Async", color: "text-purple-400", bg: "bg-purple-500/10" },
  LIVE: { label: "Live", color: "text-blue-400", bg: "bg-blue-500/10" },
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch("/api/recruiter/interviews");
        if (res.status === 403) { setLocked(true); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setInterviews(data.interviews || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load interviews");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const filtered = interviews.filter((i) => {
    const matchSearch =
      !search ||
      i.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
      i.jobTitle?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: interviews.length,
    PENDING: interviews.filter((i) => i.status === "PENDING").length,
    IN_PROGRESS: interviews.filter((i) => i.status === "IN_PROGRESS").length,
    COMPLETED: interviews.filter((i) => i.status === "COMPLETED").length,
    CANCELLED: interviews.filter((i) => i.status === "CANCELLED").length,
  };

  if (locked) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">AI Interviews — Business+</h2>
        <p className="text-slate-400 mb-8">
          Upgrade to the Business plan or higher to conduct AI-powered interviews.
        </p>
        <Link
          href="/recruiter-pricing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition"
        >
          View Plans <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Interviews</h1>
          <p className="text-slate-400 mt-1">
            {interviews.length} total · {counts.IN_PROGRESS} in progress · {counts.COMPLETED} completed
          </p>
        </div>
        <Link
          href="/recruiter/candidates"
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition"
        >
          <Plus className="w-4 h-4" />
          Start Interview
        </Link>
      </div>

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate or job..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 transition"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              statusFilter === s
                ? "bg-purple-600 text-white"
                : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {s === "ALL" ? "All" : s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-70">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No interviews yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Go to a candidate profile and click "Start Interview" to begin.
          </p>
          <Link
            href="/recruiter/candidates"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition"
          >
            <Users className="w-4 h-4" /> View Candidates
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((interview) => {
            const status = statusConfig[interview.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            const mode = modeConfig[interview.mode as keyof typeof modeConfig];
            const rec = interview.finalRecommendation
              ? recommendationConfig[interview.finalRecommendation]
              : null;
            const RecIcon = rec?.icon;
            const progress = interview.totalQuestions > 0
              ? Math.round((interview.answeredQuestions / interview.totalQuestions) * 100)
              : 0;

            return (
              <Link
                key={interview.id}
                href={`/recruiter/interviews/${interview.id}`}
                className="block rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white">
                          {interview.candidateName}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.border} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mode.bg} ${mode.color}`}>
                          {mode.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
                        {interview.jobTitle && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {interview.jobTitle}
                          </span>
                        )}
                        <span>
                          {new Date(interview.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span>{interview.answeredQuestions}/{interview.totalQuestions} answered</span>
                      </div>

                      {/* Progress bar */}
                      {interview.status !== "PENDING" && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-white/5">
                            <div
                              className="h-1.5 rounded-full bg-purple-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {interview.finalScore != null && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-bold text-white">{interview.finalScore}/100</span>
                      </div>
                    )}
                    {rec && RecIcon && (
                      <div className={`flex items-center gap-1 text-xs font-semibold ${rec.color}`}>
                        <RecIcon className="w-3.5 h-3.5" />
                        {interview.finalRecommendation}
                      </div>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
