import "@/app/globals.css"; // 🔥 REQUIRED
import type { Metadata } from "next";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Virexa",
  description: "Fitness booking platform",
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
      </body>
    </html>
  );
}
