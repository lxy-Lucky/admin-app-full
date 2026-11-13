import { message } from 'antd'
import type { AxiosRequestConfig } from 'axios'
import type { ApiError } from './error'

/**
 * 请求层依赖的应用级回调接口。
 *
 * 由应用入口注入认证状态、错误通知和错误上报等实现，
 * 避免请求模块直接依赖具体业务模块。
 */
export interface RequestHooks {
  /** 获取当前认证 Token。 */
  getToken: () => string | null | undefined
  /** 处理未授权响应，例如清理登录状态。 */
  onUnauthorized: () => void
  /** 显示全局请求错误提示。 */
  notifyError: (msg: string) => void
  /** 上报请求错误，可同时获取原始请求配置。 */
  reportError: (error: ApiError, config?: AxiosRequestConfig) => void
}

/**
 * 请求层回调实例。
 *
 * 提供安全的默认实现，应用启动时通过 configureRequest 注入实际逻辑。
 */
export const requestHooks: RequestHooks = {
  getToken: () => null,
  onUnauthorized: () => {},
  // 默认使用静态 message；AppProviders 注入后改用上下文感知的 message。
  notifyError: (msg) => {
    void message.error(msg)
  },
  reportError: () => {},
}

/**
 * 配置请求层依赖。
 *
 * 仅覆盖传入的回调，未提供的回调继续使用原有实现。
 */
export function configureRequest(hooks: Partial<RequestHooks>) {
  Object.assign(requestHooks, hooks)
}
