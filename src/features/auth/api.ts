import { http } from '@/shared/request'
import type { AuthUser } from './store'

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: AuthUser
  /** Permission codes for menus, pages and buttons; '*' grants everything. */
  permissions: string[]
}

export const authApi = {
  login: (payload: LoginPayload) => http.post<LoginResult, LoginPayload>('/auth/login', payload),
  logout: () => http.post<null>('/auth/logout', undefined, { silent: true }),
}
