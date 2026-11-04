import { Select } from 'antd'
import { LANGUAGES, changeLanguage, useLocaleStore, type Language } from '@/locales'

export default function LanguageSwitch() {
  const language = useLocaleStore((s) => s.language)
  return (
    <Select<Language>
      value={language}
      options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
      onChange={(value) => void changeLanguage(value)}
      style={{ width: 120 }}
    />
  )
}
