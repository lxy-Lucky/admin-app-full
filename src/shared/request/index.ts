import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import i18n from '@/locales'
import { env } from '@/shared/config/env'
import { REQUEST_TIMEOUT, SUCCESS_CODE, UNAUTHORIZED_CODES } from './config'
import { ApiError } from './error'
import { requestHooks } from './hooks'
import type { ApiResponse } from './types'

export * from './error'
export * from './hooks'
export * from './query-keys'
export type { ApiResponse } from './types'

/**
 * Axios 请求层核心模块
 *
 * 统一管理 HTTP 请求实例、请求与响应拦截器及错误处理。
 *
 * - 请求阶段：注入 Token 和当前语言。
 * - 响应阶段：处理统一响应结构、业务错误及异常响应。
 * - 错误处理：统一错误上报、消息通知和认证失效处理。
 * - 请求封装：提供带泛型的 HTTP 请求方法。
 */

// 项目统一 Axios 实例，集中配置 API 基础地址和请求超时时间。
export const axiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
})

/**
 * 统一处理请求错误。
 *
 * 依次执行错误上报、全局错误通知和认证失效回调，
 * 最终以 rejected Promise 的形式将错误交给调用方。
 */
function fail(error: ApiError, config?: AxiosRequestConfig): Promise<never> {
  requestHooks.reportError(error, config)
  if (!config?.silent) requestHooks.notifyError(error.message)
  if (error.kind === 'auth') requestHooks.onUnauthorized()
  return Promise.reject(error)
}

// 请求拦截：统一注入认证 Token 和当前语言。
axiosInstance.interceptors.request.use((config) => {
  // 调用方显式设置 Authorization 时，保留调用方的配置。
  const token = requestHooks.getToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['Accept-Language'] = i18n.language
  return config
})

// 响应拦截
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {

    // rawResponse 请求跳过统一响应处理，直接返回完整 AxiosResponse。
    if (res.config.rawResponse) return res

    // 预期 JSON 却收到 HTML 时，通常意味着请求被 SPA fallback 或网关错误页面接管。
    const contentType = String(res.headers?.['content-type'] ?? '')
    if (typeof res.data === 'string' && contentType.includes('text/html')) {
      return fail(new ApiError({ kind: 'network', message: i18n.t('error:network') }), res.config)
    }
    const body = res.data as Partial<ApiResponse> | null

    // 非统一响应结构（例如文件下载）不进行业务解包。
    if (!body || typeof body !== 'object' || typeof body.code !== 'number') {
      return res.data as AxiosResponse
    }

    // 业务成功时只返回 data，调用方无需再访问 response.data.data。
    if (body.code === SUCCESS_CODE) return body.data as AxiosResponse

    // 将未授权业务码转换为认证错误，其余业务错误统一归类为 business。
    const isAuth = UNAUTHORIZED_CODES.includes(body.code)
    return fail(
      new ApiError({
        kind: isAuth ? 'auth' : 'business',
        code: body.code,
        status: res.status,
        message: isAuth ? i18n.t('error:unauthorized') : body.msg || i18n.t('error:unknown'),
      }),
      res.config,
    )
  },
  (err: unknown) => {
    // 已经处理过的 ApiError 和主动取消的请求不重复转换。
    if (err instanceof ApiError || axios.isCancel(err)) return Promise.reject(err)
    const e = err as AxiosError<Partial<ApiResponse>>
    const config = e.config
    // 请求超时。
    if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') {
      return fail(new ApiError({ kind: 'timeout', message: i18n.t('error:timeout') }), config)
    }
    const status = e.response?.status
    // 没有收到 HTTP 响应，归类为网络错误。
    if (status === undefined) {
      return fail(new ApiError({ kind: 'network', message: i18n.t('error:network') }), config)
    }
    const serverMsg = e.response?.data?.msg
    // HTTP 401 表示认证失效。
    if (status === 401) {
      return fail(
        new ApiError({ kind: 'auth', status, message: i18n.t('error:unauthorized') }),
        config,
      )
    }
    // 根据 HTTP 状态码映射对应的错误提示。
    const message =
      status === 403
        ? i18n.t('error:forbidden')
        : status === 404
          ? i18n.t('error:notFound')
          : status >= 500
            ? i18n.t('error:server')
            : serverMsg || i18n.t('error:unknown')
    return fail(new ApiError({ kind: 'http', status, message }), config)
  },
)

/**
 * 类型化 HTTP 请求方法。
 *
 * 默认请求会经过响应拦截器解包统一响应结构，
 * 因此调用方直接获得业务数据，而不是完整 AxiosResponse。
 */
export const http = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<ApiResponse<T>, T>(url, config),
  post: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.post<ApiResponse<T>, T, D>(url, data, config),
  put: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.put<ApiResponse<T>, T, D>(url, data, config),
  patch: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.patch<ApiResponse<T>, T, D>(url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<ApiResponse<T>, T>(url, config),
}
