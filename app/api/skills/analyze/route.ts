import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeSkillGap } from "@/lib/ai/skill-gap-engine";
import { checkUsageLimit, trackUsage, UserRole } from "@/lib/usage-limiter";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = ((session?.user as any)?.role || "FREE") as UserRole;

    if (userId) {
      const { allowed, usage } = await checkUsageLimit(
        userId,
        "skillGap",
        role
      );

      if (!allowed) {
        return NextResponse.json(
          {
            error: `Daily limit reached (${usage.limit}/day). Upgrade to Premium for unlimited analyses.`,
            limitReached: true,
            usage,
          },
          { status: 429 }
        );
      }
    }

    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    if (resumeText.trim().length < 100) {
      return NextResponse.json(
        { error: "Resume is too short. Please provide more content." },
        { status: 400 }
      );
    }

    const cleanedResume = resumeText.trim();
    const cleanedJob = jobDescription ? jobDescription.trim() : undefined;

    const result = await analyzeSkillGap(cleanedResume, cleanedJob);

    if (userId) {
      await trackUsage(userId, "skillGap");
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Skill gap error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json(
      { error: `Failed to analyze skill gap: ${message}` },
      { status: 500 }
    );
  }
}