"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

interface OnboardingGuardProps {
    children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) return;

        if(pathname?.startsWith("/onboarding")) return;

        if(pathname?.startsWith("/studio")) return;

        const hasOnboarded = user.publicMetadata?.hasOnboarded as | boolean | undefined;

        if(hasOnboarded) {
            router.push("/onboarding");
        }
    }, [isLoaded, user, pathname,router]);

    return <>{children}</>;
}