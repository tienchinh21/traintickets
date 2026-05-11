"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureBoneyard } from "boneyard-js/react";
import { useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

configureBoneyard({
  color: "#e2e8f0",
  shimmerColor: "#f8fafc",
  animate: "shimmer",
  speed: "1.6s",
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
