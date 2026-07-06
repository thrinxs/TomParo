import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateApplicationEmail } from "@/lib/ai/application-generator";
import { checkUsageLimit, trackUsage, UserRole } from "@/lib/usage-limiter";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = ((session?.user as any)?.role || "FREE") as UserRole;

    if (userId) {
      const { allowed, usage } = await checkUsageLimit(
        userId,
        "email",
        role
      );

      if (!allowed) {
        return NextResponse.json(
          {
            error: `Daily limit reached (${usage.limit}/day). Upgrade to Premium for unlimited emails.`,
            limitReached: true,
            usage,
          },
          { status: 429 }
        );
      }
    }

    const { resumeText, jobDescription, style } = await req.json();

    if (!resumeText || !jobDescription || !style) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["formal", "modern", "concise"].includes(style)) {
      return NextResponse.json(
        { error: "Invalid style" },
        { status: 400 }
      );
    }

    const result = await generateApplicationEmail(
      resumeText.trim(),
      jobDescription.trim(),
      style
    );

    if (userId) {
      await trackUsage(userId, "email");
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Email error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json(
      { error: `Failed to generate email: ${message}` },
      { status: 500 }
    );
  }
}