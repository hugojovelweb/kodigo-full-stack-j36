"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getBrowserQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  // No usar useState(() => new QueryClient()) aquí: si React suspende durante
  // el render inicial, perdería la caché. Se usa un singleton de navegador.
  const queryClient = getBrowserQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
