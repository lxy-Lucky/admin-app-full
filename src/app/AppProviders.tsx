import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider } from 'antd'
import { useEffect, useMemo, type ReactNode } from 'react'
import { antdLocaleMap, useLocaleStore } from '@/locales'
import { configureRequest } from '@/shared/request'
import { queryClient } from '@/shared/request/query-client'
import { CssVarsSync, buildThemeConfig, useThemeStore } from '@/theme'

/** Route request-layer toasts through App.useApp() so they follow theme and locale. */
function RequestBridge() {
  const { message } = AntdApp.useApp()
  useEffect(() => {
    // key = text, so identical errors (e.g. parallel 401s) replace each other instead of stacking.
    configureRequest({ notifyError: (msg) => void message.error({ content: msg, key: msg }) })
  }, [message])
  return null
}

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
