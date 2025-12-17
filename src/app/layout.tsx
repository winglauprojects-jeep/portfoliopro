import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { PortfolioProvider } from "@/providers/portfolio-provider";
import { SourcesProvider } from "@/providers/sources-provider";
import { Toaster } from "@/components/ui/sonner";

import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortfolioPro",
  description: "Personal finance and investment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}  antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <PortfolioProvider>
            <SourcesProvider>
              <Header />
              <main className="flex-1 bg-slate-50">{children}</main>
            </SourcesProvider>
            <Toaster />
          </PortfolioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
