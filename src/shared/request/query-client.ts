import { QueryClient } from '@tanstack/react-query'
import { isRetryableError } from './error'

/**
 * TanStack Query 全局客户端
 *
 * 统一配置查询缓存、自动重新请求及失败重试策略。
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据在 30 秒内视为新鲜，期间不会因重复订阅而自动重新请求。
      staleTime: 30_000,
      // 查询数据在没有组件使用后，最多保留 5 分钟。
      gcTime: 5 * 60_000,
      // 窗口聚焦重新获取。
      refetchOnWindowFocus: false,
      // 最多重试一次，且只重试可恢复的错误。
      retry: (failureCount, error) => failureCount < 1 && isRetryableError(error),
    },
    mutations: {
      // 修改操作默认不自动重试，避免重复提交。
      retry: false,
    },
  },
})
