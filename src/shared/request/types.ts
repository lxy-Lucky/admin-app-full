/**
 * 统一 API 响应结构
 *
 * T 表示接口业务数据的类型，默认为 unknown。
 */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg: string
}

/**
 * Axios 请求配置扩展
 *
 * 为项目请求层增加自定义请求选项。
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    /** 禁止显示该请求的全局错误提示。 */
    silent?: boolean
    /** 跳过统一响应数据解包，直接返回完整 AxiosResponse。 */
    rawResponse?: boolean
  }
}
