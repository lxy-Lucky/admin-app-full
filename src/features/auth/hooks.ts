import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryClient } from '@/shared/request/query-client'
import { authApi } from './api'
import { hasPermission, useAuthStore } from './store'

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    // Errors are already toasted by the request layer. Navigation happens in GuestGuard
    // as soon as the token is set.
    onSuccess: (result) => useAuthStore.getState().setSession(result),
  })
}

/** Best-effort server logout, then wipe local session and caches. AuthGuard redirects to /login. */
export function useLogout() {
  return async () => {
    try {
      await authApi.logout()
    } catch {
      // The session is dropped locally regardless.
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
      /** Single permission code (no code = allowed). */
      can: (code?: string) => hasPermission(permissions, code),
      canAny: (codes: readonly string[]) => codes.some((c) => hasPermission(permissions, c)),
      canAll: (codes: readonly string[]) => codes.every((c) => hasPermission(permissions, c)),
    }),
    [token, user, permissions],
  )
}
