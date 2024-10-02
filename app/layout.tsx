import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

import { ChatProvider } from "@/components/chat/context";
import { Header } from "@/components/chat/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth0 AI | Market0",
  description:
    "Market0 is a demo app that showcases secure auth patterns for GenAI apps",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "h-screen")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <ChatProvider>
            <Header />
            {children}
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
