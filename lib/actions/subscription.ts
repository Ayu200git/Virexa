"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { Tier } from "../constants/subscription";

export async function syncUserSubscription() {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        // Simply revalidating the path will trigger the server components 
        revalidatePath("/profile");
        revalidatePath("/(app)/profile", "page");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Sync error:", error);
        return { success: false, error: "Failed to trigger sync" };
    }
}

export async function updateUserTier(tier: Tier) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const clerk = await clerkClient();

        // 1. Update Clerk Metadata
        await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
                plan: tier,
                tier: tier,
                subscriptionTier: tier
            }
        });

        // 2. Sync to Sanity immediately (for "payout" consistency)
        // We import these dynamically to avoid circular deps if any, 
        // or just standard top-level if safe. 
        // Using top-level imports from existing project pattern.
        const { client } = await import("@/sanity/lib/client");
        const { writeClient } = await import("@/sanity/lib/writeClient");
        const { USER_PROFILE_BY_CLERK_ID_QUERY } = await import("@/sanity/lib/queries/bookings");

        const profile = await client.fetch(USER_PROFILE_BY_CLERK_ID_QUERY, { clerkId: userId });

        if (profile) {
            await writeClient
                .patch(profile._id)
                .set({ subscriptionTier: tier })
                .commit();
        }

        revalidatePath("/profile");
        revalidatePath("/");
        revalidatePath("/classes");

        return { success: true };
    } catch (error) {
        console.error("Update tier error:", error);
        return { success: false, error: "Failed to update tier" };
    }
}

export async function clearStaleSubscriptionData() {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const clerk = await clerkClient();
        console.log(`[SubscriptionSync] Clearing stale metadata for user: ${userId}`);

        await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
                plan: null,
                tier: null,
                subscriptionTier: null
            }
        });

        revalidatePath("/profile");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Clear stale data error:", error);
        return { success: false, error: "Failed to clear data" };
    }
}
