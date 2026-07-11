import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Public — no auth required ──────────────────────────────────────────────────
// Used by signup page to show company context before user is logged in

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invite = await prisma.recruiterInvite.findUnique({
      where: { token },
      include: {
        recruiter: {
          select: { companyName: true },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invite has already been used or cancelled" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }

    // Only return safe public info — no sensitive data
    return NextResponse.json({
      valid: true,
      email: invite.email,
      role: invite.role,
      companyName: invite.recruiter.companyName,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error("Invite lookup error:", error);
    return NextResponse.json(
      { error: "Failed to load invite" },
      { status: 500 }
    );
  }
}
