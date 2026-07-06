"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  Loader2,
  ArrowRight,
} from "lucide-react";

type BillingCycle = "monthly" | "yearly";

const features = {
  free: [
    "5 CV analyses per day",
    "10 job matches per day",
    "5 cover letters per day",
    "5 application emails per day",
    "3 skill gap analyses per day",
    "Basic ATS scoring",
    "Save your history",
    "Access to dashboard",
  ],
  premium: [
    "Unlimited CV analyses",
    "Unlimited job matches",
    "Unlimited cover letters & emails",
    "Unlimited skill gap analyses",
    "Full learning roadmap & certifications",
    "AI Interview Coach (unlimited)",
    "Career Intelligence AI",
    "AI Chat Assistant",
    "Priority support inbox",
    "Advanced ATS scoring",
    "Visual CV analysis",
    "Priority AI processing",
    "No ads",
    "Cancel anytime",
  ],
};

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPremium = (session?.user as any)?.isPremium || false;

  const handleUpgrade = async () => {
    if (!session) {
      router.push("/signin?redirect=/pricing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: billingCycle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const monthlyPrice = 5000;
  const yearlyPrice = 50000;
  const yearlySavings = monthlyPrice * 12 - yearlyPrice;

  return (
    <div className="min-h-screen bg-slate-950 pb-24 pt-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
            <Sparkles className="h-4 w-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Get hired faster with{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              TomParo Premium
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Unlock all AI features, get unlimited access, and land your dream
            job faster.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium transition ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition ${
                billingCycle === "yearly"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                Save ₦10,000
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">Free</h3>
              <p className="mt-2 text-sm text-slate-400">
                Perfect to get started
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">₦0</span>
                <span className="text-slate-400">forever</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                No credit card required
              </p>
            </div>

            <Link
              href={session ? "/dashboard" : "/signup"}
              className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
            >
              {session ? "Go to Dashboard" : "Get Started Free"}
            </Link>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                What's included
              </p>
              <ul className="space-y-3">
                {features.free.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800">
                      <Check className="h-3 w-3 text-slate-400" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-orange-500/5 p-8">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Most Popular
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20">
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Premium</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Everything you need to get hired
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">
                  ₦{billingCycle === "monthly" ? "5,000" : "50,000"}
                </span>
                <span className="text-slate-400">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              {billingCycle === "yearly" && (
                <p className="mt-2 text-sm text-emerald-400">
                  💰 Save ₦{yearlySavings.toLocaleString()} per year
                </p>
              )}
              {billingCycle === "monthly" && (
                <p className="mt-2 text-sm text-slate-500">
                  or ₦50,000/year (save ₦10,000)
                </p>
              )}
            </div>

            {isPremium ? (
              <div className="w-full rounded-xl bg-emerald-500/10 py-3 text-center text-sm font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                ✓ You're on Premium
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-sm font-medium text-white shadow-lg shadow-amber-700/25 transition hover:from-amber-500 hover:to-orange-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to Paystack...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Upgrade to Premium
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}

            {error && (
              <p className="mt-3 text-center text-xs text-red-400">{error}</p>
            )}

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-400">
                Everything in Free, plus
              </p>
              <ul className="space-y-3">
                {features.premium.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                      <Check
                        className="h-3 w-3 text-amber-400"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-16">
          <h2 className="text-center text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your subscription anytime. You'll keep Premium access until the end of your billing period.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major cards (Visa, Mastercard, Verve), bank transfers, and mobile money through Paystack.",
              },
              {
                q: "Is my data safe?",
                a: "Absolutely. We use industry-standard encryption and never share your data with third parties.",
              },
              {
                q: "Can I try before I subscribe?",
    a: "Yes! Our Free plan gives you access to core features with daily limits, so you can experience TomParo before upgrading.",
  },
            ].map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <h3 className="font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-sm text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm font-medium text-slate-400">
            🇳🇬 Built in Nigeria • Payments powered by Paystack • Secure & Trusted
          </p>
        </div>
      </div>
    </div>
  );
}