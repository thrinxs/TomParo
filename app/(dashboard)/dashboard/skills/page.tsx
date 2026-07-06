"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ResumeUploader from "@/components/resume/ResumeUploader";
import SkillGapSummary from "@/components/skills/SkillGapSummary";
import {
  Sparkles,
  AlertCircle,
  Target,
  Search,
  Brain,
  TrendingUp,
  Zap,
  Briefcase,
} from "lucide-react";

export default function SkillsPage() {
  const { data: session } = useSession();
  const isPremium = (session?.user as any)?.isPremium || false;

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Search, label: "Reading your CV", duration: 5 },
    { icon: Brain, label: "Analyzing your skills", duration: 6 },
    { icon: Target, label: "Identifying skill gaps", duration: 8 },
    { icon: TrendingUp, label: "Finding market trends", duration: 6 },
    { icon: Zap, label: "Building recommendations", duration: 5 },
  ];

  const TOTAL_DURATION = 30;

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newProgress = Math.min((elapsed / TOTAL_DURATION) * 100, 99);
      setProgress(newProgress);

      let accumulatedTime = 0;
      for (let i = 0; i < steps.length; i++) {
        accumulatedTime += steps[i].duration;
        if (elapsed < accumulatedTime) {
          setCurrentStep(i);
          break;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!resumeText) {
      setError("Please provide your CV first");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);
    setProgress(0);
    setCurrentStep(0);

    try {
      const response = await fetch("/api/skills/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setProgress(100);
      setTimeout(() => {
        setResult(data.result);
      }, 500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const secondsRemaining = Math.max(
    0,
    Math.ceil(TOTAL_DURATION - (progress / 100) * TOTAL_DURATION)
  );

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
          <Sparkles className="h-3 w-3" />
          AI-Powered Skill Analysis
        </div>
        <h1 className="text-3xl font-semibold text-white">Skill Gap Analysis</h1>
        <p className="mt-2 text-slate-400">
          Discover the skills you need to advance your career. Get personalized
          recommendations, learning resources, and certification paths.
        </p>
      </div>

      {/* Step 1: CV */}
      {!resumeText && (
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-sm font-bold text-purple-400 ring-1 ring-purple-500/20">
              1
            </div>
            <h2 className="text-lg font-semibold text-white">
              Provide Your CV
            </h2>
          </div>
          <ResumeUploader onAnalyze={setResumeText} isAnalyzing={false} />
        </div>
      )}

      {/* CV Ready */}
      {resumeText && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                ✓
              </div>
              <div>
                <p className="text-sm font-medium text-white">CV Ready</p>
                <p className="text-xs text-slate-400">
                  {resumeText.length.toLocaleString()} characters loaded
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setResumeText("");
                setResult(null);
              }}
              className="text-xs text-slate-400 transition hover:text-white"
            >
              Change CV
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Optional Job Target */}
      {resumeText && (
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-slate-500 ring-1 ring-slate-700">
              2
            </div>
            <h2 className="text-lg font-semibold text-white">
              Target Job{" "}
              <span className="text-sm font-normal text-slate-500">
                (Optional)
              </span>
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <Briefcase className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Analyze for a Specific Job
                </h3>
                <p className="text-sm text-slate-400">
                  Paste a job description for job-specific skill analysis, or
                  leave empty for general career analysis
                </p>
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Optional: Paste a job description to analyze skills needed for THAT specific job..."
              className="h-40 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />

            <div className="mt-2 text-xs text-slate-500">
              {jobDescription.length.toLocaleString()} characters (leave empty
              for general analysis)
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {resumeText && !result && !isAnalyzing && (
        <button
          onClick={handleAnalyze}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-purple-700/25 transition hover:from-purple-500 hover:to-pink-500"
        >
          <Sparkles className="h-4 w-4" />
          Analyze My Skills
        </button>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <div className="mt-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-8 backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg
                className="absolute -rotate-90"
                width="128"
                height="128"
                viewBox="0 0 128 128"
              >
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgb(30 41 59)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={
                    2 * Math.PI * 56 - (progress / 100) * (2 * Math.PI * 56)
                  }
                  className="stroke-purple-500 transition-all duration-100 ease-linear"
                />
              </svg>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {secondsRemaining}s
                </div>
                <div className="text-xs text-slate-500">remaining</div>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              Analyzing your skills
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Takes about {TOTAL_DURATION} seconds
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === currentStep;
              const isComplete = i < currentStep;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    isActive
                      ? "border-purple-500/30 bg-purple-500/10"
                      : isComplete
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-white/5 bg-slate-900/40"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      isActive
                        ? "bg-purple-500/20 text-purple-400"
                        : isComplete
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-800 text-slate-600"
                    }`}
                  >
                    {isComplete ? (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : isActive ? (
                      <StepIcon className="h-4 w-4 animate-pulse" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-white"
                        : isComplete
                          ? "text-emerald-300"
                          : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 flex items-start gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <h3 className="font-semibold text-white">Analysis Failed</h3>
            <p className="mt-1 text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isAnalyzing && (
        <SkillGapSummary result={result} isPremium={isPremium} />
      )}
    </div>
  );
}