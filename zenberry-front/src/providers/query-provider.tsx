"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

// Função auxiliar para verificar se é erro HTTP 4xx
function isClientError(error: unknown): boolean {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    return (
      !!response?.status && response.status >= 400 && response.status < 500
    );
  }
  return false;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tempo que os dados ficam "fresh" (sem refetch automático)
            staleTime: 1000 * 60 * 5, // 5 minutos
            // Tempo que os dados ficam no cache
            gcTime: 1000 * 60 * 10, // 10 minutos (gcTime substituiu cacheTime na v5)
            // Retry automático em caso de erro
            retry: (failureCount, error) => {
              // Não retry em erros 4xx (client errors)
              if (isClientError(error)) {
                return false;
              }
              // Máximo 3 tentativas para outros erros
              return failureCount < 3;
            },
            // Refetch quando a janela ganha foco
            refetchOnWindowFocus: false,
            // Refetch quando a conexão é restaurada
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry para mutations (geralmente desabilitado)
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
