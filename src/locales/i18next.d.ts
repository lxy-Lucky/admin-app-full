import 'i18next'
import type auth from './zh-CN/auth.json'
import type common from './zh-CN/common.json'
import type dashboard from './zh-CN/dashboard.json'
import type error from './zh-CN/error.json'
import type layout from './zh-CN/layout.json'
import type system from './zh-CN/system.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      error: typeof error
      layout: typeof layout
      auth: typeof auth
      system: typeof system
      dashboard: typeof dashboard
    }
  }
}
