const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    customer: {
      email: string;
    };
    metadata?: {
      userId?: string;
      plan?: string;
    };
  };
}

/**
 * Initialize a Paystack transaction
 */
export async function initializePayment({
  email,
  amount, // in Naira (will convert to Kobo)
  reference,
  metadata,
  callback_url,
}: {
  email: string;
  amount: number;
  reference?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}): Promise<PaystackInitResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Convert Naira to Kobo
      reference,
      metadata,
      callback_url,
      currency: "NGN",
    }),
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Verify a Paystack transaction
 */
export async function verifyPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Paystack verify error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate a unique reference for payments
 */
export function generateReference(prefix: string = "TP"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Plan configurations
 */
export const PLANS = {
  MONTHLY: {
    name: "Premium Monthly",
    amount: 5000,
    duration: 30, // days
    plan: "monthly",
  },
  YEARLY: {
    name: "Premium Yearly",
    amount: 50000,
    duration: 365, // days
    plan: "yearly",
  },
};