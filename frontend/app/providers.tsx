"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react";
import { Toaster, toast } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          const isNetworkError = !error?.response;           // No response = network down
          const is5xx = error?.response?.status >= 500;
          const isRateLimit = error?.response?.status === 429;

          // Show toast on FIRST failure immediately
          if (failureCount === 0) {
            if (isNetworkError) {
              toast.error("Network error – retrying in the background...", {
                id: "network-error",   // prevents duplicate toasts
                duration: Infinity,    // keep until dismissed or success
              });
            } else if (is5xx) {
              toast.error("Server error – retrying...", { id: "network-error", duration: Infinity });
            }
          }

          if (isNetworkError) return failureCount < 4;
          if (is5xx) return failureCount < 3;
          if (isRateLimit) return failureCount < 5;
          return false;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        staleTime: 30 * 1000,
      },
      mutations: {
        retry: 0,
      }
    },
    // Dismiss the error toast when any query succeeds
  }))

  // Dismiss network-error toast when a query succeeds
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "success") {
      toast.dismiss("network-error")
      // optionally: toast.success("Back online!", { duration: 2000 })
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

