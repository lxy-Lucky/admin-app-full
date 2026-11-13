import { theme } from 'antd'
import { useEffect } from 'react'
import { useThemeStore } from './store'

/**
 * 主题 CSS 变量同步
 *
 * 将 Ant Design 主题 Token 同步到全局 CSS 自定义属性，
 * 供 Sass / CSS Modules 使用，并同步页面的主题模式。
 */
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
