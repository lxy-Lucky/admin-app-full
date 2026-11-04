import { QueryClient } from '@tanstack/react-query'
import { isRetryableError } from './error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => failureCount < 1 && isRetryableError(error),
    },
    mutations: { retry: false },
  },
})
