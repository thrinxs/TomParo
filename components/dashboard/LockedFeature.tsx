"use client";

import Link from "next/link";
import {
  Crown,
  Lock,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface LockedFeatureProps {
  feature: string;
  description: string;
  icon: React.ElementType;
  benefits: string[];
  color?: "amber" | "cyan" | "rose" | "purple";
}

const colorConfig = {
  amber: {
    bg: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10 ring-amber-500/20",
    iconColor: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/20",
    badgeText: "text-amber-400",
    checkColor: "text-amber-400",
    button: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500",
  },
  cyan: {
    bg: "from-cyan-500/10 to-blue-500/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10 ring-cyan-500/20",
    iconColor: "text-cyan-400",
    badgeBg: "bg-cyan-500/10 border-cyan-500/20",
    badgeText: "text-cyan-400",
    checkColor: "text-cyan-400",
    button: "from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
  },
  rose: {
    bg: "from-rose-500/10 to-pink-500/5",
    border: "border-rose-500/20",
    iconBg: "bg-rose-500/10 ring-rose-500/20",
    iconColor: "text-rose-400",
    badgeBg: "bg-rose-500/10 border-rose-500/20",
    badgeText: "text-rose-400",
    checkColor: "text-rose-400",
    button: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500",
  },
  purple: {
    bg: "from-purple-500/10 to-pink-500/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/10 ring-purple-500/20",
    iconColor: "text-purple-400",
    badgeBg: "bg-purple-500/10 border-purple-500/20",
    badgeText: "text-purple-400",
    checkColor: "text-purple-400",
    button: "from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500",
  },
};

export default function LockedFeature({
  feature,
  description,
  icon: Icon,
  benefits,
  color = "amber",
}: LockedFeatureProps) {
  const c = colorConfig[color];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Premium Badge */}
      <div className={`mb-6 inline-flex items-center gap-2 rounded-full border ${c.badgeBg} px-4 py-2 text-sm ${c.badgeText}`}>
        <Crown className="h-4 w-4" />
        Premium Feature
      </div>

      {/* Main Card */}
      <div className={`rounded-3xl border ${c.border} bg-gradient-to-br ${c.bg} p-8 md:p-12`}>
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${c.iconBg} ring-1`}>
            <div className="relative">
              <Icon className={`h-10 w-10 ${c.iconColor}`} />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 ring-2 ring-slate-950">
                <Lock className={`h-3 w-3 ${c.iconColor}`} />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {feature}
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            {description}
          </p>
        </div>

        {/* Benefits List */}
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-4"
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 ${c.checkColor}`}>
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </div>
              <p className="text-sm text-slate-200">{benefit}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${c.button} px-8 py-4 text-base font-medium text-white shadow-lg transition`}
          >
            <Sparkles className="h-5 w-5" />
            Unlock with Premium
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-slate-400">
            Starting at{" "}
            <span className="font-semibold text-white">₦5,000/month</span> — cancel anytime
          </p>
        </div>
      </div>

      {/* Social Proof / Value Prop */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <div className="text-2xl font-bold text-white">Unlimited</div>
          <div className="mt-1 text-xs text-slate-400">All AI features</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <div className="text-2xl font-bold text-white">No Ads</div>
          <div className="mt-1 text-xs text-slate-400">Focus-friendly experience</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <div className="text-2xl font-bold text-white">Priority</div>
          <div className="mt-1 text-xs text-slate-400">Faster AI responses</div>
        </div>
      </div>
    </div>
  );
}