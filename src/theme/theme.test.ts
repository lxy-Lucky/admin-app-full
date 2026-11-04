import { theme } from 'antd'
import { DEFAULT_PRIMARY_COLOR, buildThemeConfig } from './config'
import { useThemeStore } from './store'

afterEach(() => useThemeStore.getState().reset())

describe('theme', () => {
  it('buildThemeConfig picks algorithm and primary color', () => {
    const dark = buildThemeConfig('dark', '#ff0000')
    expect(dark.algorithm).toBe(theme.darkAlgorithm)
    expect(dark.token?.colorPrimary).toBe('#ff0000')
    expect(buildThemeConfig('light', DEFAULT_PRIMARY_COLOR).algorithm).toBe(theme.defaultAlgorithm)
  })

  it('store updates and resets', () => {
    const s = useThemeStore.getState()
    s.setMode('dark')
    s.setPrimaryColor('#13c2c2')
    expect(useThemeStore.getState()).toMatchObject({ mode: 'dark', primaryColor: '#13c2c2' })
    useThemeStore.getState().reset()
    expect(useThemeStore.getState()).toMatchObject({
      mode: 'light',
      primaryColor: DEFAULT_PRIMARY_COLOR,
    })
  })
})
