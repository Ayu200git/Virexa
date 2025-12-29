import { auth } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { isPast } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Heart,
  Flame,
  Bike,
  Dumbbell,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TIER_PRICING,
  // TIER_DISPLAY_NAME,
  TIER_DESCRIPTIONS,
  TIER_FEATURES,
  // TIER_TRIAL_DAYS,
  type Tier,
  FREE_TRIAL_DAYS,
  TIER_DISPLAY_NAMES,
  TIER_ACCESS,
} from "@/lib/constants/subscription";
import { icon } from "leaflet";
import { classSessionType } from "@/sanity/schemaTypes/classSessionType";
import { title } from "process";
import { SignedIn, SignedOut, SignIn, SignOutButton, SignUpButton } from "@clerk/nextjs";
import { relative } from "path";

const categories = [
  { name: "Yoga", icon: Heart, classes: "2,400+", color: "text-rose-500" },
  { name: "HIIT", icon: Flame, classes: "1000+", color: "text-orange-500" },
  { name: "Cycling", icon: Bike, classes: "600+", color: "text-amber-500" },
  { name: "Pilates", icon: Sparkles, classes: "300+", color: "text-amber-500" },
  { name: "Strength", icon: Dumbbell, classes: "3500+", color: "text-red-500" },
];

const stats = [
  { value: "10,000+", label: "Classes Available"},
  { value: "500+", label: "Partner Studios"},
  { value: "50,000+", label: "Active Members" },
  { value: "20+", label: "Cities" },
];

const steps = [
  { number: "01", title: "Choose Your Plan", description:"Select a membership thet fits your personality." },
  { number: "02", title: "Book Any Class", description: "Browse Thousands of classes and bookat studios near you." },
  { number: "03", title: "Show Up & Sweat", description: "Check in, work outand track your porgress." }
];


export default async function BookingsPage() {
   return (
     <div className="">
       {/*hero*/}
        <section className="relative overflow-hidden bg-background">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

  <div className="container relative mx-auto px-24 py-24 md:py-32 lg:py-40">
    <div className="max-w-4xl mx-auto text-center">
      <Badge
        variant="secondary"
        className="mb-6 px-4 py-1.5 text-sm font-medium bg-surface text-primary border border-border"
      >
        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
        {FREE_TRIAL_DAYS}-day free trial on all plans.
      </Badge>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-Black">
        Your Fitness Journey{" "}
        <span className="text-primary">Starts Here</span>
      </h1>

      <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
        One membership thousands of classes, unlimited possibilities.
        Find your perfect workout near you.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <SignedOut>
          <SignUpButton mode="modal">
            <Button
              size="lg"
              className="text-lg px-8 h-14 rounded-full bg-primary text-black hover:bg-primary/90"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignUpButton>
        </SignedOut>
              {/* <SignIn>
                <Button size="lg" className="text-lg px-8 h-14 rounded-full" asChild>
                  <Link href="/classes">
                    Browse Classes
                    <ArrowRight className="ml-2 h-5 w-6"/>
                  </Link>
                </Button>
              </SignIn> */}
            </div>
          </div>
        </div>
       </section>

       {/* stats*/}
        <section className="border-y border-border bg-surface/40">
  <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
            {stat.value}
          </div>
          <div className="text-muted-foreground font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/*categories*/}
      <section className="container mx-auto px-4 py-20 md:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Perfect Workout
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From High intensity training to mindful movement, that matches your fitness goals.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
             <Card key={category.name} className="group cursor-pointer translation-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 ">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-4 group-hover:scale-110 transition-transform duration-300 ${category.color}`}>
                  <category.icon className="w-7 h-7"/>
                  
                </div>
                <div className="items-center text-xl text-center">
                  {category.name}
                </div>
              </CardContent>
             </Card>
          ))}
        </div>
      </section>


       {/*steps*/}

      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Fitness Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started is Easy. you'll be booking your first class in minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/40 to-primary/10" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary text-3xl font-bold mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
              </div>
              </div>
            ))}
          </div>
        </div>
      </section> 

       {/*pricing*/}

       <section className="container mx-auto px-4 py-20 md:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose Plan thet fits your fitness rotine. All Plans includes a{" "} {FREE_TRIAL_DAYS}-days free trial.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(["basic", "performance", "champion"] as Tier[]).map((tier) => {
            const isPopular = tier === "performance";
            return (
              <Card key={tier} className={`relative transition-all duration-300 hover:shadow-xl ${
                isPopular ? "border-primary shadow-lg scale-105 md:scale-110" : "hover:-translate-y-1"
              }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1 text-sm font-semibold shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">
                    {TIER_DISPLAY_NAMES[tier]}
                  </CardTitle>
                  <CardDescription>{TIER_DESCRIPTIONS[tier]}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-5xl font-bold">${TIER_PRICING[tier].monthly}</span>
                     <span className="text-muted-foreground">/month</span>
                  </div>  
                  <p className="text-sm text-muted-foreground mb-6">
                    {TIER_ACCESS[tier]}
                  </p>
                  <ul className="space-y-3 text-left">
                    {TIER_FEATURES[tier].map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}

                  </ul>
                </CardContent>
                <CardFooter>
                  <SignedOut>
                    <SignOutButton mode="modal">
                      <Button className="w-full h-12 text-base" variant={isPopular ? "default" : "outline"} asChild >
                          Start Free Trial
                      </Button>
                    </SignOutButton>
                  </SignedOut>
                  <SignedIn>
                    <Button className="w-full h-12 text-base" variant={isPopular ? "default" : "outline"} asChild >
                      <Link href="/upgrade">Choose Plan</Link>
                    </Button>
                  </SignedIn>
                </CardFooter>
              </Card>
            );
          })}
        </div>
       </section>

       {/*cta*/}

      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255, 255, 255, 0.1),transparent_50%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255, 255, 255, 0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4 py-20 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-3xl font-bold mb-6">
              Ready to transform your fitness?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join 50,000+ members who've discovered a better way to stay fit.
              start your Fintess journey with {FREE_TRIAL_DAYS}-days free trial today.
            </p>
            <SignedOut>
  <SignUpButton mode="modal">
    <Button
      size="lg"
      variant="secondary"
      className="text-lg px-10 h-14 rounded-full font-semibold"
    >
      Get Started Now
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  </SignUpButton>
</SignedOut>

            <SignedIn>
              <Button size="lg" variant="secondary" className="text-lg px-10 h-14 rounded-full font-semibold" asChild >
                <Link href="/classes">
                  Browse Classes 
                  <ArrowRight className="ml-2 h-5 w-5"/>
                </Link>
              </Button>          
            </SignedIn>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{FREE_TRIAL_DAYS}-days free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Cancle Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>No Commitment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/*footer*/}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center text-muted-foreground mx-auto">
            <Link href="/classes" className="hover:text-foreground transition mx-auto text-center">
            Classes
            </Link>
            <Link href="/map" className="hover:text-foreground transition mx-auto text-center">
            Studios
            </Link>
            <Link href="/upgrade" className="hover:text-foreground transition mx-auto text-center">
            Pricing
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Virexa.
          </p>
        </div>
      </footer>
    </div>
  );
}
