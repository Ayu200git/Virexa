import { clerkClient } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import { USER_PROFILE_BY_CLERK_ID_QUERY } from "@/sanity/lib/queries/bookings";
import { mapPlanToTier } from "./subscription";
import type { Tier } from "./constants/subscription";

/**
 * Fetch actual user tier from Clerk (real-time) with Sanity fallback & sync
 */
export async function getUserTier(clerkId: string): Promise<Tier> {
    try {
        // 1. Fetch Clerk user data
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(clerkId);

        // 2. Clerk metadata is our primary source of truth
        const metadata = user.publicMetadata || {};

        console.log(`[SubscriptionSync] User: ${clerkId}`);
        console.log(`[SubscriptionSync] Full Public Metadata Keys:`, Object.keys(metadata));
        console.log(`[SubscriptionSync] Full Public Metadata Values:`, JSON.stringify(metadata, null, 2));

        // Extract plan identifer, handling string or object structures
        const getRawPlan = (val: any) => {
            if (!val) return null;
            if (typeof val === 'string') return val;
            // Handle common Clerk/Stripe metadata object structures
            return val.id || val.name || val.slug || val.plan_id || JSON.stringify(val);
        };

        // Search in many possible keys (Clerk/Stripe common ones)
        // Search in many possible keys (Clerk/Stripe common ones)
        // Search in many possible keys (Clerk/Stripe common ones)
        // ONLY look for specific Integration Keys (Real Data)
        const rawPlan = getRawPlan(
            metadata.stripePlan ||
            metadata.product_id ||
            metadata.price_id ||
            metadata.subscription_plan ||
            metadata.subscriptionStatus ||
            metadata.subscription_status ||
            metadata.clerk_tier ||
            // Fallback to generic keys (User's current state/Manual Integrations rely on these)
            metadata.plan ||
            metadata.tier ||
            metadata.subscriptionTier
        );
        const clerkPlan = rawPlan as string | undefined;

        console.log(`[SubscriptionSync] Resolved Plan String: "${clerkPlan || 'none'}"`);

        // 3. Fetch Sanity profile for sync check
        const profile = await client.fetch(USER_PROFILE_BY_CLERK_ID_QUERY, {
            clerkId,
        });

        // 4. Resolve Tier (Clerk is Source of Truth)
        // If Clerk has a plan, use it. If not, user is "basic".
        const resolvedTier = mapPlanToTier(clerkPlan || "basic");

        // 5. Sync to Sanity if mismatch exists
        // (This handles both Upgrades AND Downgrades/Resets)
        if (profile && profile.subscriptionTier !== (clerkPlan || "basic")) {
            console.log(`[SubscriptionSync] Syncing Sanity to Clerk Tier: ${resolvedTier}`);
            await writeClient
                .patch(profile._id)
                .set({ subscriptionTier: clerkPlan || "basic" }) // Sync the raw string or 'basic'
                .commit()
                .catch(err => console.error("Failed to sync tier to Sanity:", err));
        }

        return resolvedTier;
    } catch (error) {
        console.error("Error in getUserTier (server):", error);
        return "basic";
    }
}
