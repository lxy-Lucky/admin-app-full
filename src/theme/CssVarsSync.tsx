import { theme } from 'antd'
import { useEffect } from 'react'
import { useThemeStore } from './store'

/** Mirrors AntD tokens to CSS variables so Sass / CSS Modules follow the active theme. */
export default function CssVarsSync() {
  const { token } = theme.useToken()
  const mode = useThemeStore((s) => s.mode)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--app-color-primary', token.colorPrimary)
    root.style.setProperty('--app-color-bg-layout', token.colorBgLayout)
    root.style.setProperty('--app-color-bg-container', token.colorBgContainer)
    root.style.setProperty('--app-color-text', token.colorText)
    root.style.setProperty('--app-color-border', token.colorBorderSecondary)
    root.dataset.theme = mode
    root.style.colorScheme = mode
  }, [token, mode])

  return null
}
