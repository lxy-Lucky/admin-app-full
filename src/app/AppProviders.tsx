import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider } from 'antd'
import { useEffect, useMemo, type ReactNode } from 'react'
import { antdLocaleMap, useLocaleStore } from '@/locales'
import { configureRequest } from '@/shared/request'
import { queryClient } from '@/shared/request/query-client'
import { CssVarsSync, buildThemeConfig, useThemeStore } from '@/theme'

/**
 * 将请求层的错误通知接入 Ant Design App。
 *
 * 通过 App.useApp() 获取 message 实例，使请求错误提示
 * 使用当前应用的主题和配置。
 */
function RequestBridge() {
  const { message } = AntdApp.useApp()
  useEffect(() => {
    // 使用错误消息作为 key，避免并发请求产生相同错误提示时重复堆叠。
    configureRequest({ notifyError: (msg) => void message.error({ content: msg, key: msg }) })
  }, [message])
  return null
}

/**
 * 全局 Provider 组合
 *
 * 统一配置 React Query、Ant Design、国际化和主题，
 * 并同步请求层的错误通知与全局 CSS 变量。
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  const language = useLocaleStore((s) => s.language)
  const mode = useThemeStore((s) => s.mode)
  const primaryColor = useThemeStore((s) => s.primaryColor)
  const themeConfig = useMemo(() => buildThemeConfig(mode, primaryColor), [mode, primaryColor])

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={antdLocaleMap[language]} theme={themeConfig}>
        <AntdApp>
          <RequestBridge />
          <CssVarsSync />
          {children}
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
