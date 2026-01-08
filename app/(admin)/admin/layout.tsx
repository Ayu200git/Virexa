import { Providers } from "@/components/providers/Providers";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SanityLive } from "@/sanity/lib/live";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  // Primary Email Check (Strict & Case-insensitive)
  const isAuthorized = user?.emailAddresses?.some(
    (email) => email.emailAddress.toLowerCase() === "ayushks2805@gmail.com"
  );

  if (!isAuthorized) {
    redirect("/"); // Kick out unauthorized users
  }

  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-6">
          {children}
          <SanityLive />
        </main>
      </div>
    </Providers>
  );
}
