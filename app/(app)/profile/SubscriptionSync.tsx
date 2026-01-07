"use client";

import { useState, useTransition } from "react";
import { syncUserSubscription, clearStaleSubscriptionData } from "@/lib/actions/subscription";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2, ShieldX } from "lucide-react";

export function SubscriptionSync() {
    const [isPending, startTransition] = useTransition();

    const handleSync = () => {
        startTransition(async () => {
            await syncUserSubscription();
        });
    };

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary relative"
                onClick={handleSync}
                disabled={isPending}
                title="Sync with Billing"
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
                {isPending && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap font-medium text-primary animate-pulse">
                        Syncing...
                    </span>
                )}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-50 hover:opacity-100 transition-all"
                onClick={() => {
                    if (confirm("This will reset your account metadata to fix any 'stuck' plans. Continue?")) {
                        startTransition(async () => {
                            await clearStaleSubscriptionData();
                        });
                    }
                }}
                disabled={isPending}
                title="Fix Stuck Plan (Reset Metadata)"
            >
                <ShieldX className="h-4 w-4" />
            </Button>
        </div>
    );
}
