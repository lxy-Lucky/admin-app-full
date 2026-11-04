import enUS from 'antd/locale/en_US'
import jaJP from 'antd/locale/ja_JP'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/en'
import 'dayjs/locale/ja'
import 'dayjs/locale/zh-cn'

export const LANGUAGES = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' },
] as const

export type Language = (typeof LANGUAGES)[number]['value']

export const DEFAULT_LANGUAGE: Language = 'zh-CN'

export const antdLocaleMap: Record<Language, typeof zhCN> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
}

export const dayjsLocaleMap: Record<Language, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en',
  'ja-JP': 'ja',
}
