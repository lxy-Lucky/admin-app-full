import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '@/features/auth'

/** Redirects to /login (remembering where the user was heading) when not signed in. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

/** Keeps signed-in users away from the login page; honors the remembered `from` target. */
export function GuestGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  return token ? <Navigate to={from} replace /> : children
}
