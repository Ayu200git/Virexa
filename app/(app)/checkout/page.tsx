"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import NextImage from "next/image";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TIER_PRICING, TIER_DISPLAY_NAMES, Tier } from "@/lib/constants/subscription";
import { updateUserTier } from "@/lib/actions/subscription";
import { Badge } from "@/components/ui/badge";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const tier = (searchParams.get("tier") as Tier) || "basic";
    const interval = searchParams.get("interval") || "month";

    const price = interval === "year"
        ? TIER_PRICING[tier].annual
        : TIER_PRICING[tier].monthly;

    const handlePayment = () => {
        startTransition(async () => {
            try {
                const result = await updateUserTier(tier);
                if (result.success) {
                    router.push("/profile"); // Redirect to profile after success
                } else {
                    console.error(result.error);
                }
            } catch (error) {
                console.error(error);
            }
        });
    };

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl border-primary/20 bg-background">
                <CardHeader className="text-center border-b pb-6">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Secure Checkout</CardTitle>
                    <CardDescription>Complete your subscription upgrade</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Order Summary */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Plan</span>
                            <span className="font-bold text-lg">{TIER_DISPLAY_NAMES[tier]}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Billing Interval</span>
                            <span className="capitalize">{interval}ly</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center">
                            <span className="font-bold">Total due today</span>
                            <span className="font-black text-2xl text-primary">${price}</span>
                        </div>
                    </div>

                    {/* Payment Method Stub */}
                    <div className="space-y-3 opacity-60 pointer-events-none grayscale">
                        <div className="flex items-center gap-2 border p-3 rounded-lg bg-background">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Card ending in 4242</span>
                            <Badge variant="outline" className="ml-auto">Default</Badge>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-3 pt-2">
                    <Button
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                        onClick={handlePayment}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing Payment...
                            </>
                        ) : (
                            `Pay $${price}`
                        )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground flex items-center gap-1 justify-center mt-2">
                        <ShieldCheck className="h-3 w-3" />
                        Payments processed securely.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
