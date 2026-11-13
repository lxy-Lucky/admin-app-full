import { useAuthStore } from '@/features/auth'
import { configureRequest } from '@/shared/request'
import { queryClient } from '@/shared/request/query-client'

/**
 * 请求层认证配置
 *
 * 将认证状态接入请求模块，统一处理 Token 获取、
 * 未授权响应及相关缓存清理。
 */
configureRequest({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    // 并发 401 时，仅首次执行未授权清理，避免重复处理。
    if (!useAuthStore.getState().token) return
    useAuthStore.getState().clear()
    queryClient.clear()
    // 清除 Token 后由 AuthGuard 监听认证状态并重定向到登录页。
  },
})
