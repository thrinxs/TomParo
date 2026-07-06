import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { matchResumeToJob } from "@/lib/ai/job-analyzer";
import { checkUsageLimit, trackUsage, UserRole } from "@/lib/usage-limiter";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = ((session?.user as any)?.role || "FREE") as UserRole;

    // Check usage limits
    if (userId) {
      const { allowed, usage } = await checkUsageLimit(
        userId,
        "jobMatch",
        role
      );

      if (!allowed) {
        return NextResponse.json(
          {
            error: `Daily limit reached (${usage.limit}/day). Upgrade to Premium for unlimited matches.`,
            limitReached: true,
            usage,
          },
          { status: 429 }
        );
      }
    }

    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      );
    }

    const cleanedResume = resumeText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    const cleanedJob = jobDescription
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    const matchResult = await matchResumeToJob(cleanedResume, cleanedJob);

    // Track usage
    if (userId) {
      await trackUsage(userId, "jobMatch");
    }

    return NextResponse.json({
      success: true,
      matchResult,
    });
  } catch (error) {
    console.error("Job match error:", error);
    const message = error instanceof Error ? error.message : "Match failed";
    return NextResponse.json(
      { error: `Failed to match job: ${message}` },
      { status: 500 }
    );
  }
}