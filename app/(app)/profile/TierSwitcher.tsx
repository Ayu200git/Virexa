"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserTier } from "@/lib/actions/subscription";
import { TIER_OPTIONS, TIER_COLORS, Tier } from "@/lib/constants/subscription";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierSwitcherProps {
    currentTier: Tier;
}

export function TierSwitcher({ currentTier }: TierSwitcherProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleUpdate = (tier: Tier) => {
        if (tier === currentTier) return;

        setError(null);
        startTransition(async () => {
            const result = await updateUserTier(tier);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Failed to update tier");
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                Testing: Manual Tier Switcher
            </div>

            <div className="flex flex-wrap gap-2">
                {TIER_OPTIONS.map((option) => {
                    const isActive = currentTier === option.value;
                    const tierValue = option.value as Tier;

                    return (
                        <button
                            key={option.value}
                            disabled={isPending}
                            onClick={() => handleUpdate(tierValue)}
                            className={cn(
                                "relative flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200",
                                isActive
                                    ? cn(TIER_COLORS[tierValue], "border-primary ring-2 ring-primary/20 scale-105 shadow-md")
                                    : "border-border bg-card hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground",
                                isPending && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isActive && (
                                <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}

                            {option.label}
                            {isActive && option.value === "champion" && (
                                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>

            {isPending && (
                <div className="flex items-center gap-2 text-xs font-medium text-primary animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Updating Clerk profile...
                </div>
            )}

            {error && (
                <p className="text-xs font-semibold text-destructive">{error}</p>
            )}

            <p className="text-[10px] font-medium text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/50">
                <span className="font-bold text-primary mr-1">Note:</span>
                This directly updates your Clerk metadata. Use this to bypass sync issues and test "Champion" features immediately.
            </p>
        </div>
    );
}
