"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, Loader2, Users, Shield,
  Building2, ArrowRight, Mail,
} from "lucide-react";

function AcceptInviteInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [inviteInfo, setInviteInfo] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid invite link — no token found.");
      return;
    }

    const loadInvite = async () => {
      try {
        const res = await fetch(`/api/recruiter/team/invite?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Invalid invite link");
          return;
        }
        setInviteInfo(data);
        setStatus("ready");
      } catch {
        setStatus("error");
        setMessage("Failed to load invite. Please try again.");
      }
    };

    loadInvite();
  }, [token]);

  const handleCreateAccount = () => {
    router.push(
      `/signup?inviteToken=${token}&email=${encodeURIComponent(inviteInfo.email)}&company=${encodeURIComponent(inviteInfo.companyName)}`
    );
  };

  const handleSignIn = () => {
    router.push(`/signin?callbackUrl=/recruiter/invite/accept?token=${token}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">

        {/* Loading */}
        {status === "loading" && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Loading your invite...</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white font-bold text-xl mb-2">Invalid Invite</p>
            <p className="text-slate-400">{message}</p>
          </div>
        )}

        {/* Ready — show invite details */}
        {status === "ready" && inviteInfo && (
          <>
            {/* Header card */}
            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-2">
                Team Invitation
              </p>
              <h1 className="text-2xl font-bold text-white mb-2">
                You've been invited! 🎉
              </h1>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-semibold">
                  {inviteInfo.companyName}
                </span>{" "}
                has invited you to join their recruitment team on TomParo
              </p>
            </div>

            {/* Invite details */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <p className="text-xs font-semibold text-white uppercase tracking-wider">
                Invite Details
              </p>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Company</p>
                  <p className="text-sm font-semibold text-white">{inviteInfo.companyName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Invited Email</p>
                  <p className="text-sm font-semibold text-white">{inviteInfo.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm font-semibold text-white capitalize">
                    {inviteInfo.role.toLowerCase()} — Team Member
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Expires</p>
                  <p className="text-sm font-semibold text-white">
                    {new Date(inviteInfo.expiresAt).toLocaleDateString("en-NG", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* What you can do */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <p className="text-xs font-semibold text-white uppercase tracking-wider">
                As a team member you can:
              </p>
              {[
                "Upload and analyse CVs",
                "Manage job postings",
                "Send emails to candidates",
                "View the talent pool and pipeline",
                "Access the analytics dashboard",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-400">
                    Settings, billing, and team management are admin-only
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCreateAccount}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition"
              >
                Create Account & Join Team
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSignIn}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition"
              >
                Already have an account? Sign in
              </button>
            </div>

            <p className="text-center text-xs text-slate-600">
              You must sign up or sign in with{" "}
              <span className="text-slate-400">{inviteInfo.email}</span>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    }>
      <AcceptInviteInner />
    </Suspense>
  );
}
