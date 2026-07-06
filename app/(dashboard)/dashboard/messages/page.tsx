"use client";

import { useSession } from "next-auth/react";
import LockedFeature from "@/components/dashboard/LockedFeature";
import { Inbox } from "lucide-react";

export default function MessagesPage() {
  const { data: session } = useSession();
  const isPremium = (session?.user as any)?.isPremium || false;

  if (!isPremium) {
    return (
      <LockedFeature
        feature="Priority Support Inbox"
        description="Get priority support with a dedicated inbox for all your customer service conversations."
        icon={Inbox}
        color="amber"
        benefits={[
          "Direct access to priority support",
          "All support chats in one place",
          "Faster response times",
          "Full conversation history",
          "Attach files to support requests",
          "Mark conversations as resolved",
          "Reopen closed tickets anytime",
          "Real-time notifications",
        ]}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-white">Messages</h1>
      <p className="mt-2 text-slate-400">Support inbox — coming soon</p>
    </div>
  );
}