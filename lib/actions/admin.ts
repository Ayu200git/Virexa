"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/writeClient";

async function checkAdmin() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    // Ideally check for specific email here too for extra safety, 
    // but middleware already protects the route.
}

export async function deleteActivity(id: string) {
    try {
        await checkAdmin();
        await writeClient.delete(id);
        revalidatePath("/admin/activities");
        revalidatePath("/admin");
        revalidatePath("/classes");
        return { success: true, message: "Activity deleted" };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, error: "Failed to delete" };
    }
}

export async function deleteVenue(id: string) {
    try {
        await checkAdmin();
        await writeClient.delete(id);
        revalidatePath("/admin/venues");
        revalidatePath("/admin");
        return { success: true, message: "Venue deleted" };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, error: "Failed to delete" };
    }
}

export async function createActivity(data: {
    name: string;
    instructor: string;
    duration: number;
    tierLevel: string;
}) {
    try {
        await checkAdmin();
        const newDoc = await writeClient.create({
            _type: "activity",
            name: data.name,
            instructor: data.instructor,
            duration: data.duration,
            tierLevel: data.tierLevel,
        });
        revalidatePath("/admin/activities");
        revalidatePath("/admin");
        revalidatePath("/classes");
        return { success: true, id: newDoc._id };
    } catch (error) {
        console.error("Create activity error:", error);
        return { success: false, error: typeof error === 'string' ? error : "Failed to create activity" };
    }
}

export async function createVenue(data: {
    name: string;
    description?: string;
    address?: {
        fullAddress: string;
        street: string;
        city: string;
        postcode: string;
        country: string;
        lat: number;
        lng: number;
    };
}) {
    try {
        await checkAdmin();
        const newDoc = await writeClient.create({
            _type: "venue",
            name: data.name,
            description: data.description,
            address: data.address,
        });
        revalidatePath("/admin/venues");
        revalidatePath("/admin");
        return { success: true, id: newDoc._id };
    } catch (error) {
        console.error("Create venue error:", error);
        return { success: false, error: typeof error === 'string' ? error : "Failed to create venue" };
    }
}

export async function cancelBookingAdmin(bookingId: string) {
    try {
        await checkAdmin();
        await writeClient.patch(bookingId).set({ status: "cancelled" }).commit();
        revalidatePath("/admin/bookings");
        revalidatePath("/admin");
        revalidatePath("/bookings");
        revalidatePath("/classes");
        return { success: true, message: "Booking cancelled" };
    } catch (error) {
        console.error("Cancel error:", error);
        return { success: false, error: "Failed to cancel" };
    }
}
