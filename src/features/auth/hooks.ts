import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryClient } from '@/shared/request/query-client'
import { authApi } from './api'
import { hasPermission, useAuthStore } from './store'

/**
 * 登录 Mutation。
 *
 * 登录成功后保存 Token、用户信息和权限列表，
 * 后续由 GuestGuard 根据认证状态处理页面跳转。
 */
export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    // 请求层已经统一处理错误通知；登录成功后的跳转由 GuestGuard 负责。
    onSuccess: (result) => useAuthStore.getState().setSession(result),
  })
}

/**
 * 退出登录。
 *
 * 尽力请求服务端退出登录，然后无论请求是否成功，
 * 都清理本地 Session 和 TanStack Query 缓存。
 * 本地认证状态清除后，由 AuthGuard 跳转至登录页。
 */
export function useLogout() {
  return async () => {
    try {
      await authApi.logout()
    } catch {
      // 服务端退出失败时，仍然清理本地登录状态。
    }
    useAuthStore.getState().clear()
    queryClient.clear()
  }
}

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const permissions = useAuthStore((s) => s.permissions)

  return useMemo(
    () => ({
      isAuthenticated: !!token,
      user,
      permissions,
      /** 检查单个权限码；未传入权限码时默认允许。 */
      can: (code?: string) => hasPermission(permissions, code),
      /** 检查是否拥有至少一个指定权限。 */
      canAny: (codes: readonly string[]) => codes.some((c) => hasPermission(permissions, c)),
      /** 检查是否拥有全部指定权限。 */
      canAll: (codes: readonly string[]) => codes.every((c) => hasPermission(permissions, c)),
    }),
    [token, user, permissions],
  )
}
