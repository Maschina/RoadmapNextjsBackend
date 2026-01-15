'use client';

import { QueryClient } from '@tanstack/react-query';

/**
 * Create a new QueryClient instance with default options
 * This should be called once per request/session
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Browser-side QueryClient instance (singleton)
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get the QueryClient instance for the browser
 * Creates a new instance if one doesn't exist
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
