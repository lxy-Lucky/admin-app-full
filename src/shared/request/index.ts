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

export const axiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
})

function fail(error: ApiError, config?: AxiosRequestConfig): Promise<never> {
  requestHooks.reportError(error, config)
  if (!config?.silent) requestHooks.notifyError(error.message)
  if (error.kind === 'auth') requestHooks.onUnauthorized()
  return Promise.reject(error)
}

axiosInstance.interceptors.request.use((config) => {
  const token = requestHooks.getToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['Accept-Language'] = i18n.language
  return config
})

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    if (res.config.rawResponse) return res
    const body = res.data as Partial<ApiResponse> | null
    // Not an envelope (e.g. file download): pass the payload through untouched.
    if (!body || typeof body !== 'object' || typeof body.code !== 'number') {
      return res.data as AxiosResponse
    }
    if (body.code === SUCCESS_CODE) return body.data as AxiosResponse
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
    if (err instanceof ApiError || axios.isCancel(err)) return Promise.reject(err)
    const e = err as AxiosError<Partial<ApiResponse>>
    const config = e.config
    if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') {
      return fail(new ApiError({ kind: 'timeout', message: i18n.t('error:timeout') }), config)
    }
    const status = e.response?.status
    if (status === undefined) {
      return fail(new ApiError({ kind: 'network', message: i18n.t('error:network') }), config)
    }
    const serverMsg = e.response?.data?.msg
    if (status === 401) {
      return fail(
        new ApiError({ kind: 'auth', status, message: i18n.t('error:unauthorized') }),
        config,
      )
    }
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

/** Typed helpers: the response interceptor unwraps `{ code, data, msg }`, so callers get `data`. */
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
