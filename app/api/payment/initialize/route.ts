import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  initializePayment,
  generateReference,
  PLANS,
} from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to subscribe" },
        { status: 401 }
      );
    }

    const { plan } = await req.json();

    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'monthly' or 'yearly'" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email!;

    const selectedPlan =
      plan === "monthly" ? PLANS.MONTHLY : PLANS.YEARLY;

    const reference = generateReference("TP");

    const origin =
      req.headers.get("origin") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const callback_url = `${origin}/dashboard?payment=success&reference=${reference}`;

    const paymentResponse = await initializePayment({
      email: userEmail,
      amount: selectedPlan.amount,
      reference,
      callback_url,
      metadata: {
        userId,
        plan: selectedPlan.plan,
        planName: selectedPlan.name,
      },
    });

    if (!paymentResponse.status) {
      throw new Error(paymentResponse.message);
    }

    return NextResponse.json({
      success: true,
      authorization_url: paymentResponse.data.authorization_url,
      reference: paymentResponse.data.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    const message =
      error instanceof Error ? error.message : "Payment failed";
    return NextResponse.json(
      { error: `Failed to initialize payment: ${message}` },
      { status: 500 }
    );
  }
}