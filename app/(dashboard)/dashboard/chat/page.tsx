"use client";

import { useSession } from "next-auth/react";
import LockedFeature from "@/components/dashboard/LockedFeature";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  const { data: session } = useSession();
  const isPremium = (session?.user as any)?.isPremium || false;

  if (!isPremium) {
    return (
      <LockedFeature
        feature="AI Career Chat"
        description="Chat directly with AI about your career, get answers to your questions, and understand your analysis in detail."
        icon={MessageCircle}
        color="purple"
        benefits={[
          "Unlimited AI chat messages",
          "Ask anything about your career",
          "Get detailed explanations of your scores",
          "Understand your CV analysis better",
          "Get advice on specific job opportunities",
          "Explore skill development strategies",
          "Personalized career planning conversations",
          "AI remembers your CV and history",
        ]}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-white">AI Chat</h1>
      <p className="mt-2 text-slate-400">AI Chat interface — coming soon</p>
    </div>
  );
}