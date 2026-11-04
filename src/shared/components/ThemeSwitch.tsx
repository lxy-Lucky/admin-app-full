import { Button, ColorPicker, Segmented, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { PRESET_COLORS, useThemeStore, type ThemeMode } from '@/theme'

export default function ThemeSwitch() {
  const { t } = useTranslation()
  const { mode, primaryColor, setMode, setPrimaryColor, reset } = useThemeStore()
  return (
    <Space>
      <Segmented<ThemeMode>
        value={mode}
        onChange={setMode}
        options={[
          { value: 'light', label: t('theme.light') },
          { value: 'dark', label: t('theme.dark') },
        ]}
      />
      <ColorPicker
        value={primaryColor}
        disabledAlpha
        presets={[{ label: t('theme.primaryColor'), colors: PRESET_COLORS }]}
        onChangeComplete={(color) => setPrimaryColor(color.toHexString())}
      />
      <Button onClick={reset}>{t('theme.reset')}</Button>
    </Space>
  )
}
