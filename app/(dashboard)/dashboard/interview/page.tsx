"use client";

import { useSession } from "next-auth/react";
import LockedFeature from "@/components/dashboard/LockedFeature";
import { MessageSquare } from "lucide-react";

export default function InterviewPage() {
  const { data: session } = useSession();
  const isPremium = (session?.user as any)?.isPremium || false;

  if (!isPremium) {
    return (
      <LockedFeature
        feature="AI Interview Coach"
        description="Practice with AI-generated interview questions and get real-time feedback to ace your next interview."
        icon={MessageSquare}
        color="rose"
        benefits={[
          "Unlimited mock interview sessions",
          "AI-generated questions specific to your role",
          "3 difficulty levels (Quick, Standard, Full)",
          "4 question types (HR, Technical, Behavioral, Mixed)",
          "Real-time feedback on every answer",
          "Detailed strengths and improvements analysis",
          "Interview Readiness Score",
          "Save all your practice sessions",
        ]}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-white">Interview Coach</h1>
      <p className="mt-2 text-slate-400">Interview coaching interface — coming soon</p>
    </div>
  );
}