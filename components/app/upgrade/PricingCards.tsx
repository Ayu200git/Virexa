"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TIER_PRICING, TIER_FEATURES, TIER_DISPLAY_NAMES, Tier } from "@/lib/constants/subscription";
import { updateUserTier } from "@/lib/actions/subscription";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface PricingCardsProps {
    currentTier?: Tier | null;
}

export function PricingCards({ currentTier }: PricingCardsProps) {
    const [isAnnual, setIsAnnual] = useState(false);
    const [pendingTier, setPendingTier] = useState<Tier | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleUpgrade = (tier: Tier) => {
        setPendingTier(tier);
        startTransition(async () => {
            try {
                const result = await updateUserTier(tier);
                if (result.success) {
                    router.refresh();
                } else {
                    console.error(result.error);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setPendingTier(null);
            }
        });
    };

    const tiers: Tier[] = ["basic", "performance", "champion"];

    return (
        <div className="space-y-8">
            {/* Toggle */}
            <div className="flex justify-center items-center space-x-4">
                <Label htmlFor="billing-toggle" className={cn("font-medium cursor-pointer", !isAnnual && "text-primary")}>Monthly</Label>
                <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
                <Label htmlFor="billing-toggle" className={cn("font-medium cursor-pointer", isAnnual && "text-primary")}>
                    Yearly <span className="text-xs text-muted-foreground font-normal ml-1">(Save 17%)</span>
                </Label>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                {tiers.map((tier) => {
                    const price = isAnnual ? TIER_PRICING[tier].annual : TIER_PRICING[tier].monthly;
                    const features = TIER_FEATURES[tier];
                    const isCurrent = currentTier === tier;
                    const isLoading = isPending && pendingTier === tier;
                    const isPopular = tier === "performance";

                    return (
                        <Card key={tier} className={cn(
                            "relative flex flex-col transition-all duration-300",
                            isPopular
                                ? "border-primary shadow-2xl scale-105 z-10 bg-background"
                                : "border-border hover:border-primary/50 hover:shadow-lg bg-background/50"
                        )}>
                            {isPopular && (
                                <div className="absolute -top-4 inset-x-0 flex justify-center">
                                    <Badge className="bg-primary hover:bg-primary px-3 py-1 text-sm shadow-md">Most Popular</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">{TIER_DISPLAY_NAMES[tier]}</CardTitle>
                                <CardDescription>
                                    {tier === "basic" && "Essential access for casual fitness."}
                                    {tier === "performance" && "Perfect for regular gym-goers."}
                                    {tier === "champion" && "Unlimited access for the elite."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-6 flex items-baseline">
                                    <span className="text-4xl font-bold">${price}</span>
                                    <span className="text-muted-foreground ml-1">/{isAnnual ? "year" : "month"}</span>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    {features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <Check className="mr-2 h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className={cn("w-full font-semibold", isPopular ? "shadow-lg shadow-primary/20" : "")}
                                    variant={isPopular ? "default" : "outline"}
                                    disabled={isCurrent || isPending}
                                    onClick={() => handleUpgrade(tier)}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : isCurrent ? (
                                        "Current Plan"
                                    ) : (
                                        isAnnual ? `Subscribe Yearly` : `Subscribe Monthly`
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
