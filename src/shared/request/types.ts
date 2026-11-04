export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg: string
}

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Do not show the global error toast for this request. */
    silent?: boolean
    /** Skip envelope unwrapping and return the full AxiosResponse. */
    rawResponse?: boolean
  }
}
