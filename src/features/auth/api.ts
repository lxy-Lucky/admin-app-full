import { http } from '@/shared/request'
import type { AuthUser } from './store'

/** 登录接口请求参数。 */
export interface LoginPayload {
  username: string
  password: string
}

/** 登录接口响应数据。 */
export interface LoginResult {
  /** 身份认证 Token。 */
  token: string
  /** 当前登录用户信息。 */
  user: AuthUser
  /** 菜单、页面和按钮权限码；'*' 表示拥有全部权限。 */
  permissions: string[]
}

/**
 * 认证模块 API。
 *
 * 统一封装登录和退出登录请求，
 * 返回数据类型由 LoginPayload 和 LoginResult 约束。
 */
export const authApi = {
  /** 用户登录，返回 Token、用户信息和权限列表。 */
  login: (payload: LoginPayload) => http.post<LoginResult, LoginPayload>('/auth/login', payload),
  /** 用户退出登录，静默处理请求错误。 */
  logout: () => http.post<null>('/auth/logout', undefined, { silent: true }),
}
