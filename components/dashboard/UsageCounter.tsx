"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Target,
  Mail,
  Sparkles,
  MessageSquare,
  Brain,
  MessageCircle,
  TrendingUp,
  Crown,
  Zap,
} from "lucide-react";

const actionInfo: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  resumeAnalysis: { label: "CV Analysis", icon: FileText, color: "blue" },
  jobMatch: { label: "Job Match", icon: Target, color: "cyan" },
  coverLetter: { label: "Cover Letter", icon: Sparkles, color: "emerald" },
  email: { label: "Email Draft", icon: Mail, color: "amber" },
  skillGap: { label: "Skill Analysis", icon: TrendingUp, color: "purple" },
  interview: { label: "Interview", icon: MessageSquare, color: "rose" },
  chat: { label: "AI Chat", icon: MessageCircle, color: "pink" },
  career: { label: "Career AI", icon: Brain, color: "indigo" },
};

interface UsageCounterProps {
  compact?: boolean;
}

export default function UsageCounter({ compact = false }: UsageCounterProps) {
  const [usage, setUsage] = useState<any[]>([]);
  const [role, setRole] = useState<string>("FREE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/user/usage");
        const data = await res.json();
        if (data.success) {
          setUsage(data.usage);
          setRole(data.role);
        }
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const isPremium = role === "PREMIUM" || role === "ADMIN";

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
      </div>
    );
  }

  // Filter to show only actions that have limits (not premium-only)
  const visibleActions = usage.filter((u) => u.limit > 0 || u.isUnlimited);

  if (compact) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Today's Usage
          </h3>
          {isPremium ? (
            <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
              <Crown className="h-3 w-3" />
              Premium
            </span>
          ) : (
            <Link
              href="/pricing"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Upgrade →
            </Link>
          )}
        </div>
        <div className="space-y-2">
          {visibleActions.slice(0, 4).map((item) => {
            const info = actionInfo[item.action];
            if (!info) return null;
            const percent = item.isUnlimited
              ? 100
              : (item.count / item.limit) * 100;

            return (
              <div key={item.action} className="text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-slate-400">{info.label}</span>
                  <span className="text-slate-500">
                    {item.isUnlimited
                      ? "Unlimited"
                      : `${item.count}/${item.limit}`}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.isUnlimited
                        ? "bg-emerald-500"
                        : percent >= 100
                          ? "bg-red-500"
                          : percent >= 80
                            ? "bg-amber-500"
                            : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Today's Usage
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Your daily AI feature usage resets at midnight
          </p>
        </div>
        {isPremium ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2">
            <Crown className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">
              Premium Plan
            </span>
          </div>
        ) : (
          <Link
            href="/pricing"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-amber-700/25 transition hover:from-amber-500 hover:to-orange-500"
          >
            <Zap className="h-4 w-4" />
            Upgrade to Premium
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleActions.map((item) => {
          const info = actionInfo[item.action];
          if (!info) return null;
          const Icon = info.icon;
          const percent = item.isUnlimited
            ? 100
            : (item.count / item.limit) * 100;

          return (
            <div
              key={item.action}
              className="rounded-2xl border border-white/5 bg-slate-900/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${info.color}-500/10`}
                >
                  <Icon className={`h-4 w-4 text-${info.color}-400`} />
                </div>
                {item.isUnlimited && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                    ∞
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">{info.label}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {item.count}
                </span>
                <span className="text-xs text-slate-500">
                  / {item.isUnlimited ? "∞" : item.limit}
                </span>
              </div>
              {!item.isUnlimited && (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent >= 100
                        ? "bg-red-500"
                        : percent >= 80
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}