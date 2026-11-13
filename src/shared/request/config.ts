/**
 * 请求层通用常量
 *
 * 统一管理 API 业务状态码及请求超时配置。
 */

/** API 业务响应中的成功状态码。 */
export const SUCCESS_CODE = 0

/** 表示未登录或 Token 已过期的业务状态码。 */
export const UNAUTHORIZED_CODES: readonly number[] = [401]

/** 请求超时时间，单位为毫秒。 */
export const REQUEST_TIMEOUT = 15_000
