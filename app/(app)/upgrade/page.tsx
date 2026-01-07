import { PricingCards } from "@/components/app/upgrade/PricingCards";
import Link from "next/link";
import NextImage from "next/image";
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Building2,
} from "lucide-react";
import { TIER_DISPLAY_NAMES } from "@/lib/constants/subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/subscription-server";

interface PageProps {
  searchParams: Promise<{
    required?: string;
    sessionId?: string;
  }>;
}

export default async function UpgradePage({ searchParams }: PageProps) {
  const { required, sessionId } = await searchParams;
  const { userId } = await auth();
  const userTier = userId ? await getUserTier(userId) : "basic";

  const requiredTierName = required
    ? TIER_DISPLAY_NAMES[required as keyof typeof TIER_DISPLAY_NAMES] ||
    required
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative border-b overflow-hidden">
        <div className="absolute inset-0 z-0">
          <NextImage
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80"
            alt="Fitness background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-background/90" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16 text-center text-white">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-0 backdrop-blur-md">
            <Sparkles className="h-3 w-3 mr-1" />
            3-day free trial on all plans
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            {requiredTierName ? (
              <>
                Upgrade to{" "}
                <span className="text-white underline decoration-white/30 decoration-4">
                  {requiredTierName}
                </span>
              </>
            ) : (
              <>
                Choose Your <span className="text-white underline decoration-white/30 decoration-4">Plan</span>
              </>
            )}
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            {requiredTierName
              ? `This class requires a ${requiredTierName} subscription or higher. Choose a plan below to start booking.`
              : "Unlock access to thousands of fitness classes with flexible monthly plans."}
          </p>
          {sessionId && (
            <p className="text-white/60 text-sm mt-6 font-bold uppercase tracking-widest animate-pulse">
              Instant Access After Subscription
            </p>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* Pricing Table */}
        <div className="max-w-5xl mx-auto">
          <PricingCards currentTier={userTier as any} />
        </div>



        {/* Features Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            All Plans Include
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center transition-all hover:shadow-lg hover:border-primary/30">
              <CardContent className="pt-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3-Day Free Trial</h3>
                <p className="text-sm text-muted-foreground">
                  Try any plan risk-free for 3 days
                </p>
              </CardContent>
            </Card>
            <Card className="text-center transition-all hover:shadow-lg hover:border-primary/30">
              <CardContent className="pt-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Cancel Anytime</h3>
                <p className="text-sm text-muted-foreground">
                  No contracts, cancel whenever you want
                </p>
              </CardContent>
            </Card>
            <Card className="text-center transition-all hover:shadow-lg hover:border-primary/30">
              <CardContent className="pt-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">500+ Venues</h3>
                <p className="text-sm text-muted-foreground">
                  Access premium studios across the city
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link
            href={sessionId ? `/classes/${sessionId}` : "/classes"}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {sessionId ? "class" : "classes"}
          </Link>
        </div>
      </main>
    </div>
  );
}
