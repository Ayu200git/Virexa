 import type { Tier } from "./constants/subscription";
import {
  TIER_HIERARCHY,
  TIER_LIMITS,
  TIER_PRICING,
  TIER_FEATURES,
  TIER_DISPLAY_NAMES,
  TIER_DESCRIPTIONS,
  TIER_ACCESS,
  TIER_COLORS,
  FREE_TRIAL_DAYS,
} from "./constants/subscription";

/**
 * Map Clerk plan key → application tier
 */
export function getUserTier(planKey?: string | null): Tier {
  if (planKey === "champion") return "champion";
  if (planKey === "performance") return "performance";
  return "basic";
}

/**
 * Full tier info (used in profile, pricing UI, etc.)
 */
export function getUserTierInfo(tier: Tier) {
  return {
    tier,
    hierarchy: TIER_HIERARCHY[tier],
    limits: TIER_LIMITS[tier],
    pricing: TIER_PRICING[tier],
    displayName: TIER_DISPLAY_NAMES[tier],
    description: TIER_DESCRIPTIONS[tier],
    access: TIER_ACCESS[tier],
    features: TIER_FEATURES[tier],
    color: TIER_COLORS[tier],
    freeTrialDays: FREE_TRIAL_DAYS,
  };
}

/**
 * Check if a user can access a class of a given tier
 */
export function canAccessClass(
  userTier: Tier,
  requiredTier: Tier
): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

/**
 * Calculate remaining bookings for the current period
 */
export function getRemainingBookings(
  tier: Tier,
  usedBookings: number
  ): number {
  const limit = TIER_LIMITS[tier];
  if (limit === Infinity) return Infinity;
  return Math.max(limit - usedBookings, 0);
}

/**
 * Usage statistics for dashboards / bookings page
 */
export function getUsageStats(
  tier: Tier,
  usedBookings: number
) {
  const limit = TIER_LIMITS[tier];

  return {
    tier,
    used: usedBookings,
    limit,
    remaining:
      limit === Infinity ? Infinity : Math.max(limit - usedBookings, 0),
    isUnlimited: limit === Infinity,
    percentageUsed:
      limit === Infinity
        ? 0
        : Math.min((usedBookings / limit) * 100, 100),
  };
}
