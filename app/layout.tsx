import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { UserProvider } from "@auth0/nextjs-auth0/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth0 AI | Market0",
  description: "Market0 is a demo app that showcases secure auth patterns for GenAI apps",
  alternates: {
    canonical: process.env.AUTH0_BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: "@auth0",
    creator: "@auth0",
    title: "Auth0 AI | Market0",
    description: "Market0 is a demo app that showcases secure auth patterns for GenAI apps",
    images: {
      url: "https://cdn.auth0.com/website/labs/ai/assets/market0-card.png",
      width: 1200,
      height: 630,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Auth0 AI | Market0",
    title: "Auth0 AI | Market0",
    description: "Market0 is a demo app that showcases secure auth patterns for GenAI apps",
    locale: "en",
    url: process.env.AUTH0_BASE_URL,
    images: {
      url: "https://cdn.auth0.com/website/labs/ai/assets/market0-card.png",
      secureUrl: "https://cdn.auth0.com/website/labs/ai/assets/market0-card.png",
      width: 1200,
      height: 630,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "h-screen")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Toaster />
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
