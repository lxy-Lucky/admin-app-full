import { theme, type ThemeConfig } from 'antd'

export type ThemeMode = 'light' | 'dark'

export const DEFAULT_PRIMARY_COLOR = '#1677ff'
export const PRESET_COLORS = [
  '#1677ff',
  '#13c2c2',
  '#52c41a',
  '#fa8c16',
  '#f5222d',
  '#722ed1',
  '#eb2f96',
]

export function buildThemeConfig(mode: ThemeMode, primaryColor: string): ThemeConfig {
  return {
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: primaryColor,
      borderRadius: 6,
    },
    // Per-component customization goes here.
    components: {
      Layout: { headerHeight: 56, headerPadding: '0 16px' },
      Card: { borderRadiusLG: 8 },
    },
  }
}
