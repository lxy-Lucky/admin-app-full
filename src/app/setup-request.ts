import { useAuthStore } from '@/features/auth'
import { configureRequest } from '@/shared/request'
import { queryClient } from '@/shared/request/query-client'

configureRequest({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    // Parallel 401s: only the first one finds a token to drop.
    if (!useAuthStore.getState().token) return
    useAuthStore.getState().clear()
    queryClient.clear()
    // AuthGuard sees the cleared token and redirects to /login, remembering the current page.
  },
})
