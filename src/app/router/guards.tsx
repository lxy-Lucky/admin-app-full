import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '@/features/auth'

/**
 * 身份认证路由守卫
 *
 * 未登录时重定向到登录页，并记录用户原本要访问的地址。
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

/**
 * 游客路由守卫
 *
 * 已登录用户禁止访问登录页，自动跳转到之前记录的目标地址。
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  return token ? <Navigate to={from} replace /> : children
}
