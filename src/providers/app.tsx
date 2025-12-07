"use client";

import React from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { PortfolioProvider } from "@/providers/portfolio-provider";
import { SourcesProvider } from "@/providers/sources-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <SourcesProvider>
          {children}
          <Toaster />
        </SourcesProvider>
      </PortfolioProvider>
    </AuthProvider>
  );
}
