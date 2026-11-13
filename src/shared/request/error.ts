/**
 * API 错误处理工具
 *
 * 统一定义请求错误类型，并提供自动重试判断规则。
 */

/** API 请求错误分类。 */
export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'business' | 'auth'

/**
 * 统一 API 错误对象。
 *
 * 在标准 Error 基础上补充错误分类、业务状态码和 HTTP 状态码，
 * 供请求层、错误提示和重试逻辑使用。
 */
export class ApiError extends Error {
  /** 错误分类。 */
  readonly kind: ApiErrorKind
  /** 后端业务响应中的状态码。 */
  readonly code?: number
  /** HTTP 响应状态码，未收到响应时为空。 */
  readonly status?: number

  constructor(init: { kind: ApiErrorKind; message: string; code?: number; status?: number }) {
    super(init.message)
    this.name = 'ApiError'
    this.kind = init.kind
    if (init.code !== undefined) this.code = init.code
    if (init.status !== undefined) this.status = init.status
  }
}

/**
 * 判断 API 错误是否适合自动重试。
 *
 * - 网络错误、超时错误：允许重试。
 * - HTTP 5xx 错误：允许重试。
 * - 业务错误、认证错误及 HTTP 4xx 错误：不允许重试。
 * - 非 ApiError 类型：不允许重试。
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.kind === 'network' || error.kind === 'timeout') return true
  return error.kind === 'http' && (error.status ?? 0) >= 500
}
