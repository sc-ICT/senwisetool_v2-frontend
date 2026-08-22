// providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider, useTheme } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

// Composant séparé pour accéder à useTheme()
// (useTheme doit être appelé à l'intérieur de ThemeProvider)
function SonnerToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      richColors
      expand
      theme={resolvedTheme === "light" ? "light" : "dark"}
      toastOptions={{
        style: {
          // Variables qui existent dans ton globals.css
          background: "var(--color-surface-raised)", // #0f1f2e
          border: "1px solid var(--color-border-light)", // #1e3448
          color: "var(--color-foreground)", // #e8f4fd
          fontFamily: "var(--font-sans)",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        {children}
        <SonnerToaster />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
