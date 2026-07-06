import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateCoverLetter } from "@/lib/ai/application-generator";
import { checkUsageLimit, trackUsage, UserRole } from "@/lib/usage-limiter";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = ((session?.user as any)?.role || "FREE") as UserRole;

    if (userId) {
      const { allowed, usage } = await checkUsageLimit(
        userId,
        "coverLetter",
        role
      );

      if (!allowed) {
        return NextResponse.json(
          {
            error: `Daily limit reached (${usage.limit}/day). Upgrade to Premium for unlimited cover letters.`,
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

    const cleanedResume = resumeText.trim();
    const cleanedJob = jobDescription.trim();

    const result = await generateCoverLetter(cleanedResume, cleanedJob);

    if (userId) {
      await trackUsage(userId, "coverLetter");
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Cover letter error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json(
      { error: `Failed to generate cover letter: ${message}` },
      { status: 500 }
    );
  }
}