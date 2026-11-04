import type { ReactNode } from 'react'
import { useAuth } from '../hooks'

interface AuthProps {
  /** Required permission code. */
  code?: string
  /** Allowed when the user has at least one of these codes. */
  anyOf?: readonly string[]
  /** Allowed only when the user has all of these codes. */
  allOf?: readonly string[]
  /** Rendered when access is denied (default: nothing). */
  fallback?: ReactNode
  children: ReactNode
}

/** Operation-level permission: <Auth code="system:user:edit"><Button>Edit</Button></Auth> */
export default function Auth({ code, anyOf, allOf, fallback = null, children }: AuthProps) {
  const { can, canAny, canAll } = useAuth()
  const allowed = can(code) && (!anyOf || canAny(anyOf)) && (!allOf || canAll(allOf))
  return allowed ? children : fallback
}
