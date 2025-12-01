"use client";

import React from "react";
import { AuthProvider } from "./auth-provider";
import { PortfolioProvider } from "./portfolio-provider";
import { SourcesProvider } from "./sources-provider";
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
