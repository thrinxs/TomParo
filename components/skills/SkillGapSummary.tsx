"use client";

import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BookOpen,
  Clock,
  Zap,
  Lock,
  Crown,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface SkillGapSummaryProps {
  result: any;
  isPremium?: boolean;
}

export default function SkillGapSummary({
  result,
  isPremium = false,
}: SkillGapSummaryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreRing = (score: number) => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-cyan-500";
    if (score >= 40) return "stroke-amber-500";
    return "stroke-red-500";
  };

  const getImportanceColor = (importance: string) => {
    if (importance === "critical")
      return "border-red-500/20 bg-red-500/10 text-red-300";
    if (importance === "important")
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "easy")
      return "bg-emerald-500/10 text-emerald-400";
    if (difficulty === "medium")
      return "bg-amber-500/10 text-amber-400";
    return "bg-red-500/10 text-red-400";
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset =
    circumference - (result.overallScore / 100) * circumference;

  return (
    <div className="mt-8 space-y-6">
      {/* Career Level & Score Card */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-8 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-around">
          <div className="relative flex h-48 w-48 items-center justify-center">
            <svg
              className="absolute -rotate-90"
              width="192"
              height="192"
              viewBox="0 0 192 192"
            >
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="rgb(30 41 59)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="70"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${getScoreRing(result.overallScore)} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="text-center">
              <div
                className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}
              >
                {result.overallScore}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                Career Readiness
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <div className="mb-2 text-xs uppercase tracking-wider text-cyan-400">
              Your Career Path
            </div>
            <div className="mb-2">
              <div className="text-sm text-slate-500">Current Level</div>
              <div className="text-xl font-bold text-white">
                {result.currentLevel}
              </div>
            </div>
            <div className="my-3 flex items-center justify-center gap-2 text-slate-600 md:justify-start">
              <div className="h-px w-8 bg-slate-700" />
              <TrendingUp className="h-4 w-4" />
              <div className="h-px w-8 bg-slate-700" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Target Level</div>
              <div className="text-xl font-bold text-cyan-400">
                {result.targetLevel}
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300">
              <Clock className="h-3 w-3" />
              Time to Ready: {result.estimatedTimeToReady}
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          <TrendingUp className="h-4 w-4" />
          Market Insights
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm font-medium text-emerald-400">
              Demand Level
            </p>
            <p className="mt-2 text-sm text-slate-200">
              {result.marketInsights.demandLevel}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-sm font-medium text-cyan-400">Salary Impact</p>
            <p className="mt-2 text-sm text-slate-200">
              {result.marketInsights.salaryImpact}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              Trending Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.marketInsights.trending.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
                >
                  📈 {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-medium text-red-400">
              <TrendingDown className="h-3 w-3" />
              Declining Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.marketInsights.declining.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300"
                >
                  📉 {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Skills */}
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Skills You Have ({result.currentSkills.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.currentSkills.map((skill: string, i: number) => (
            <span
              key={i}
              className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300"
            >
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Skills — Free Preview */}
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-red-400">
          <AlertCircle className="h-4 w-4" />
          Skills You're Missing ({result.missingSkills.length})
        </h3>

        <div className="space-y-3">
          {result.missingSkills.map((skill: any, i: number) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-white">{skill.skill}</h4>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${getImportanceColor(skill.importance)}`}
                    >
                      {skill.importance}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${getDifficultyColor(skill.difficulty)}`}
                    >
                      {skill.difficulty}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {skill.timeToLearn}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Zap className="h-3 w-3" />+{skill.matchImprovement}%
                      match
                    </span>
                  </div>
                </div>
              </div>

              {/* Premium Content — Locked for Free Users */}
              {!isPremium ? (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                      <Lock className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-300">
                        Premium: Learning Resources & Certifications
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Unlock personalized learning paths, course
                        recommendations, and certification guides for this
                        skill.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Learning Resources */}
                  {skill.learningResources?.length > 0 && (
                    <div className="mt-4">
                      <h5 className="mb-2 flex items-center gap-2 text-xs font-medium text-blue-400">
                        <BookOpen className="h-3 w-3" />
                        Learning Resources
                      </h5>
                      <div className="space-y-2">
                        {skill.learningResources.map((resource: any, j: number) => (
                          <a
                            key={j}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-800/40 p-3 transition hover:bg-slate-800/60"
                          >
                            <div className="flex-1">
                              <p className="text-sm text-slate-200">
                                {resource.title}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {resource.platform} • {resource.duration}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                  resource.type === "free"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-amber-500/10 text-amber-400"
                                }`}
                              >
                                {resource.type}
                              </span>
                              <ExternalLink className="h-3 w-3 text-slate-500" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {skill.certifications?.length > 0 && (
                    <div className="mt-4">
                      <h5 className="mb-2 flex items-center gap-2 text-xs font-medium text-purple-400">
                        <Award className="h-3 w-3" />
                        Recommended Certifications
                      </h5>
                      <div className="space-y-2">
                        {skill.certifications.map((cert: any, j: number) => (
                          <a
                            key={j}
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 transition hover:bg-purple-500/10"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                  {cert.name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                  {cert.provider} • {cert.duration}
                                </p>
                                <p className="mt-1 text-xs text-purple-300">
                                  💡 {cert.value}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold text-purple-300">
                                  {cert.cost}
                                </span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Learning Roadmap — Premium Only */}
      {isPremium ? (
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-6 backdrop-blur-xl">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
            <Target className="h-4 w-4" />
            Your Learning Roadmap
          </h3>
          <div className="space-y-4">
            {result.skillRoadmap.map((phase: any, i: number) => (
              <div
                key={i}
                className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400 ring-1 ring-cyan-500/30">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-white">
                        {phase.phase}
                      </h4>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      {phase.focus}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {phase.skills.map((skill: string, j: number) => (
                        <span
                          key={j}
                          className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-emerald-400">
                      🎯 Outcome: {phase.outcome}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-8 backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20">
              <Crown className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white">
              🎯 Get Your Personalized Learning Roadmap
            </h3>
            <p className="mt-3 text-slate-300">
              Premium users get a detailed, phase-by-phase learning roadmap
              tailored to their career goals with specific courses,
              certifications, and timeline.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
              <span className="rounded-full bg-slate-900/60 px-3 py-1">
                ✨ Phase-by-phase plan
              </span>
              <span className="rounded-full bg-slate-900/60 px-3 py-1">
                📚 Curated resources
              </span>
              <span className="rounded-full bg-slate-900/60 px-3 py-1">
                🏆 Certification paths
              </span>
            </div>
            <Link
              href="/pricing"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-amber-700/25 transition hover:from-amber-500 hover:to-orange-500"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </Link>
          </div>
        </div>
      )}

      {/* Recommended Skills */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          <TrendingUp className="h-4 w-4" />
          Growth Recommendations
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {result.recommendedSkills.map((skill: any, i: number) => (
            <div
              key={i}
              className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4"
            >
              <h4 className="font-medium text-white">{skill.skill}</h4>
              <p className="mt-1 text-xs text-slate-400">{skill.reason}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-purple-300">
                  📊 {skill.marketDemand}
                </span>
                <span className="text-emerald-400">💰 {skill.salaryImpact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}