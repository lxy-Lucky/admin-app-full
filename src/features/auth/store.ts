import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  name: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  /** Permission codes; '*' grants everything. */
  permissions: string[]
  setSession: (session: { token: string; user?: AuthUser; permissions: string[] }) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      setSession: ({ token, user, permissions }) => set({ token, user: user ?? null, permissions }),
      clear: () => set({ token: null, user: null, permissions: [] }),
    }),
    { name: 'app-auth' },
  ),
)

export function hasPermission(permissions: readonly string[], code?: string): boolean {
  if (!code) return true
  return permissions.includes('*') || permissions.includes(code)
}
