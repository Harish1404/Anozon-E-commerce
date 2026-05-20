"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          const isNetworkError = !error?.response;
          const is5xx = error?.response?.status >= 500;
          const isRateLimit = error?.response?.status === 429;

          // Show toast only on first failure
          if (failureCount === 0) {
            if (isNetworkError) {
              toast.error("Network error – retrying...", {
                id: "network-error",
                duration: Infinity,
              });
            } else if (is5xx) {
              toast.error("Server is having issues – retrying...", {
                id: "network-error",
                duration: Infinity,
              });
            }
          }

          if (isNetworkError) return failureCount < 4;
          if (is5xx) return failureCount < 3;
          if (isRateLimit) return failureCount < 5;
          return false;
        },

        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),

        // === Important Changes for your use case ===
        staleTime: 30 * 1000,           // 30 seconds
        gcTime: 5 * 60 * 1000,          // 5 minutes (was previously called cacheTime)
        refetchOnWindowFocus: true,     // ← Changed to true (Critical for you)
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchInterval: false,         // Only enable on specific pages if needed
      },
      mutations: {
        retry: 1,                       // Usually 0 or 1 for mutations
      },
    },
  }));

  // Better way to handle toast dismissal
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "success") {
        toast.dismiss("network-error");
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}