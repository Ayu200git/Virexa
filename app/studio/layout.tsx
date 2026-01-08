import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export default async function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    // If not logged in, middleware handles it, but double check
    if (!user) {
        redirect("/");
    }

    // Strict email check for Admin/Studio access
    const email = user.emailAddresses[0]?.emailAddress;
    if (email !== "ayushks2805@gmail.com") {
        redirect("/");
    }

    return (
        <div className="h-full">
            {/* We don't wrap with AppHeader or other UI for Studio, just the auth check */}
            {children}
        </div>
    );
}
