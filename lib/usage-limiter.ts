import { prisma } from "./prisma";

export type UsageAction =
  | "resumeAnalysis"
  | "jobMatch"
  | "coverLetter"
  | "email"
  | "skillGap"
  | "interview"
  | "chat"
  | "career";

export type UserRole = "GUEST" | "FREE" | "PREMIUM" | "ADMIN";

// Daily limits per action per role
const DAILY_LIMITS: Record<UserRole, Record<UsageAction, number>> = {
  GUEST: {
    resumeAnalysis: 2,
    jobMatch: 3,
    coverLetter: 2,
    email: 2,
    skillGap: 1,
    interview: 0,
    chat: 0,
    career: 0,
  },
  FREE: {
    resumeAnalysis: 5,
    jobMatch: 10,
    coverLetter: 5,
    email: 5,
    skillGap: 3,
    interview: 0,
    chat: 0,
    career: 0,
  },
  PREMIUM: {
    resumeAnalysis: 999,
    jobMatch: 999,
    coverLetter: 999,
    email: 999,
    skillGap: 999,
    interview: 999,
    chat: 999,
    career: 999,
  },
  ADMIN: {
    resumeAnalysis: 999,
    jobMatch: 999,
    coverLetter: 999,
    email: 999,
    skillGap: 999,
    interview: 999,
    chat: 999,
    career: 999,
  },
};

export interface UsageInfo {
  action: UsageAction;
  count: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  canUse: boolean;
}

/**
 * Get today's date at midnight (for daily reset)
 */
function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get user's current usage for a specific action today
 */
export async function getUserUsage(
  userId: string,
  action: UsageAction,
  role: UserRole = "FREE"
): Promise<UsageInfo> {
  const limit = DAILY_LIMITS[role][action];
  const isUnlimited = limit >= 999;

  if (!userId) {
    return {
      action,
      count: 0,
      limit,
      remaining: limit,
      isUnlimited,
      canUse: limit > 0,
    };
  }

  try {
    const usage = await prisma.usageTracking.findUnique({
      where: {
        userId_action_date: {
          userId,
          action,
          date: getTodayDate(),
        },
      },
    });

    const count = usage?.count || 0;
    const remaining = Math.max(0, limit - count);

    return {
      action,
      count,
      limit,
      remaining,
      isUnlimited,
      canUse: isUnlimited || count < limit,
    };
  } catch (error) {
    console.error("Error checking usage:", error);
    return {
      action,
      count: 0,
      limit,
      remaining: limit,
      isUnlimited,
      canUse: limit > 0,
    };
  }
}

/**
 * Increment usage count for a user
 */
export async function trackUsage(
  userId: string,
  action: UsageAction
): Promise<void> {
  if (!userId) return;

  try {
    await prisma.usageTracking.upsert({
      where: {
        userId_action_date: {
          userId,
          action,
          date: getTodayDate(),
        },
      },
      create: {
        userId,
        action,
        date: getTodayDate(),
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error tracking usage:", error);
  }
}

/**
 * Get all usage for a user across all actions
 */
export async function getAllUserUsage(
  userId: string,
  role: UserRole = "FREE"
): Promise<UsageInfo[]> {
  const actions: UsageAction[] = [
    "resumeAnalysis",
    "jobMatch",
    "coverLetter",
    "email",
    "skillGap",
    "interview",
    "chat",
    "career",
  ];

  const usagePromises = actions.map((action) =>
    getUserUsage(userId, action, role)
  );

  return Promise.all(usagePromises);
}

/**
 * Check if user has reached their limit for an action
 */
export async function checkUsageLimit(
  userId: string,
  action: UsageAction,
  role: UserRole = "FREE"
): Promise<{ allowed: boolean; usage: UsageInfo }> {
  const usage = await getUserUsage(userId, action, role);
  return {
    allowed: usage.canUse,
    usage,
  };
}