"use client";

import { useSession } from "next-auth/react";
import LockedFeature from "@/components/dashboard/LockedFeature";
import { Brain } from "lucide-react";

export default function CareerPage() {
  const { data: session } = useSession();
  const isPremium = (session?.user as any)?.isPremium || false;

  if (!isPremium) {
    return (
      <LockedFeature
        feature="Career Intelligence AI"
        description="Get personalized career insights based on your CV. Discover skills to acquire, certifications to pursue, and your next career move."
        icon={Brain}
        color="cyan"
        benefits={[
          "AI analyzes your entire career trajectory",
          "Discover skills you should acquire next",
          "Get certification recommendations",
          "Identify experience gaps holding you back",
          "See your current vs target career level",
          "Understand market demand for your profile",
          "Personalized roadmap to next career level",
          "Salary insights based on your skills",
        ]}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-white">Career AI</h1>
      <p className="mt-2 text-slate-400">Career intelligence interface — coming soon</p>
    </div>
  );
}