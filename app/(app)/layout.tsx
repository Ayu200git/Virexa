import { ClerkProvider } from "@clerk/nextjs";
import { AppHeader } from "@/components/app/layout/AppHeader";
import { OnboardingGuard } from "@/components/app/onboarding/OnboardingGuard";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { AppShell } from "@/components/app/layout/AppShell";
import { ChatButton } from "@/components/app/chat/ChatButton";
import { ChatSheet } from "@/components/app/chat/ChatSheet";
import { SanityLiveWrapper } from "@/components/providers/SanityLiveWrapper";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ChatStoreProvider>
        <OnboardingGuard>
          <AppShell>
            <AppHeader />
            {children}
            <SanityLiveWrapper />
          </AppShell>
          <ChatButton />
          <ChatSheet />
        </OnboardingGuard>
      </ChatStoreProvider>
    </ClerkProvider>
  );
}
