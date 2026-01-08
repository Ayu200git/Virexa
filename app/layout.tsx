import "@/app/globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers/Providers";
import { SanityLive } from "@/sanity/lib/live";

export const metadata: Metadata = {
  title: "Virexa",
  description: "Fitness classes booking platform",
  icons: {
    icon: "/virexa.png",
    shortcut: "/virexa.png",
    apple: "/virexa.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
        <SanityLive />
      </body>
    </html>
  );
}
