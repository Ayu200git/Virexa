import { ClerkProvider } from "@clerk/nextjs";
import { SanityLive } from "@/sanity/lib/live";
import { AppHeader } from "@/components/app/layout/AppHeader";
import { OnboardingGuard } from "@/components/app/onboarding/OnboardingGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <OnboardingGuard>
        <AppHeader />
          {children}
        <SanityLive />
      </OnboardingGuard>
    </ClerkProvider>
  );
}
