"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle, XCircle, Loader2, Users, Shield } from "lucide-react";

function AcceptInviteInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = searchParams.get("token");

  const [inviteStatus, setInviteStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [inviteInfo, setInviteInfo] = useState<any>(null);

  // ── Step 1: Load invite info (public — no auth needed) ──
  useEffect(() => {
    if (!token) {
      setInviteStatus("error");
      setMessage("Invalid invite link — no token found.");
      return;
    }

    const loadInvite = async () => {
      try {
        const res = await fetch(`/api/recruiter/team/invite?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setInviteStatus("error");
          setMessage(data.error || "Invalid invite link");
          return;
        }
        setInviteInfo(data);
        setCompanyName(data.companyName);
      } catch {
        setInviteStatus("error");
        setMessage("Failed to load invite. Please try again.");
      }
    };

    loadInvite();
  }, [token]);

  // ── Step 2: Once invite info is loaded + session known, act ──
  useEffect(() => {
    if (!inviteInfo || status === "loading") return;

    // Not logged in → redirect to signup with invite context
    if (status === "unauthenticated") {
      router.push(`/signup?inviteToken=${token}&email=${encodeURIComponent(inviteInfo.email)}&company=${encodeURIComponent(inviteInfo.companyName)}`);
      return;
    }

    // Logged in with wrong email
    const sessionEmail = (session?.user as any)?.email;
    if (sessionEmail !== inviteInfo.email) {
      setInviteStatus("error");
      setMessage(`This invite was sent to ${inviteInfo.email}. You are signed in as ${sessionEmail}.`);
      return;
    }

    // Logged in with correct email → accept invite
    const acceptInvite = async () => {
      try {
        const res = await fetch("/api/recruiter/team/invite/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setInviteStatus("error");
          setMessage(data.error || "Failed to accept invite");
        } else {
          setInviteStatus("success");
          setCompanyName(data.companyName);
          setTimeout(() => router.push("/recruiter"), 3000);
        }
      } catch {
        setInviteStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    acceptInvite();
  }, [inviteInfo, status, session, token, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">

        {(inviteStatus === "loading" || status === "loading") && (
          <>
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Loading your invite...</p>
            {companyName && (
              <p className="text-slate-400 text-sm mt-2">from {companyName}</p>
            )}
          </>
        )}

        {inviteStatus === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-white font-bold text-xl mb-2">You're in! 🎉</p>
            <p className="text-slate-400">
              You've joined{" "}
              <span className="text-white font-semibold">{companyName}</span>'s
              recruitment team.
            </p>
            <p className="text-slate-500 text-sm mt-3">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {inviteStatus === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white font-bold text-xl mb-2">Invite Failed</p>
            <p className="text-slate-400 mb-6">{message}</p>

            {message.includes("signed in as") && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left mb-6">
                <p className="text-xs text-amber-400 font-semibold mb-1">Wrong account</p>
                <p className="text-xs text-slate-400">
                  Sign out and sign in with the correct email address, then click
                  the invite link again.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/signup?inviteToken=${token}&email=${encodeURIComponent(inviteInfo?.email || "")}&company=${encodeURIComponent(companyName)}`)}
                className="px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition"
              >
                Create account with correct email
              </button>
              <button
                onClick={() => router.push("/signin")}
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition"
              >
                Sign in with correct account
              </button>
            </div>
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
