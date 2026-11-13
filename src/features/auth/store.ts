import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 当前登录用户的基本信息。 */
export interface AuthUser {
  name: string
}

interface AuthState {
  /** 身份认证 Token，未登录时为 null。 */
  token: string | null
  /** 当前登录用户信息，未登录时为 null。 */
  user: AuthUser | null
  /** 用户拥有的权限码；'*' 表示拥有全部权限。 */
  permissions: string[]
  /** 保存登录会话，包括 Token、用户信息和权限列表。 */
  setSession: (session: { token: string; user?: AuthUser; permissions: string[] }) => void
  /** 清除本地登录会话及权限信息。 */
  clear: () => void
}

/**
 * 认证状态 Store。
 *
 * 使用 Zustand 管理 Token、用户信息和权限列表，
 * 通过 persist 中间件持久化到 localStorage，
 * 页面刷新后恢复登录状态。
 */
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

/**
 * 判断用户是否拥有指定权限。
 *
 * 未指定权限码时默认允许；
 * 拥有通配符 '*' 时允许所有权限；
 * 否则要求权限列表中包含指定权限码。
 */
export function hasPermission(permissions: readonly string[], code?: string): boolean {
  if (!code) return true
  return permissions.includes('*') || permissions.includes(code)
}
