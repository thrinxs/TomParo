import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyPayment, PLANS } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify with Paystack
    const verification = await verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      return NextResponse.json(
        {
          error: "Payment was not successful",
          status: verification.data?.status || "failed",
        },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const paymentMetadata = verification.data.metadata;

    // Verify the userId matches
    if (paymentMetadata?.userId !== userId) {
      return NextResponse.json(
        { error: "User mismatch — please contact support" },
        { status: 403 }
      );
    }

    const plan = paymentMetadata.plan === "yearly" ? "yearly" : "monthly";
    const selectedPlan = plan === "yearly" ? PLANS.YEARLY : PLANS.MONTHLY;
    const amount = verification.data.amount / 100; // Convert Kobo to Naira

    // Calculate period end
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + selectedPlan.duration);

    // Update user role to PREMIUM
    await prisma.user.update({
      where: { id: userId },
      data: { role: "PREMIUM" },
    });

    // Create or update subscription
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "ACTIVE",
        plan,
        amount,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        paystackSubCode: reference,
      },
      update: {
        status: "ACTIVE",
        plan,
        amount,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        paystackSubCode: reference,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      subscription: {
        plan,
        amount,
        currentPeriodEnd: periodEnd,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    const message =
      error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json(
      { error: `Failed to verify payment: ${message}` },
      { status: 500 }
    );
  }
}