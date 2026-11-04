import { message } from 'antd'
import type { AxiosRequestConfig } from 'axios'
import type { ApiError } from './error'

export interface RequestHooks {
  getToken: () => string | null | undefined
  onUnauthorized: () => void
  notifyError: (msg: string) => void
  reportError: (error: ApiError, config?: AxiosRequestConfig) => void
}

export const requestHooks: RequestHooks = {
  getToken: () => null,
  onUnauthorized: () => {},
  // Static fallback; AppProviders swaps in the context-aware App.useApp().message.
  notifyError: (msg) => {
    void message.error(msg)
  },
  reportError: () => {},
}

/** Wire the request layer to the rest of the app (auth store, notifier, error reporting). */
export function configureRequest(hooks: Partial<RequestHooks>) {
  Object.assign(requestHooks, hooks)
}
