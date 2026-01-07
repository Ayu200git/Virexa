"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { Tier } from "../constants/subscription";

export async function syncUserSubscription() {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        // Simply revalidating the path will trigger the server components 
        // to call getUserTier again, which performs the Clerk -> Sanity sync.
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
        await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
                plan: tier, // Standardize on 'plan' key
                tier: tier, // Set multiple keys for robustness
                subscriptionTier: tier
            }
        });

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
