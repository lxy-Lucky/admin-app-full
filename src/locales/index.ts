import dayjs from 'dayjs'
import i18n, { type Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANGUAGE, LANGUAGES, dayjsLocaleMap, type Language } from './config'
import { useLocaleStore } from './store'

export * from './config'
export { useLocaleStore } from './store'

/**
 * 国际化初始化入口
 *
 * 统一管理语言资源加载、i18next 初始化和语言切换，
 * 并同步 Day.js、HTML lang 属性及持久化语言状态。
 */
// 根据 ./<lng>/<ns>.json 自动加载语言资源，新增语言或命名空间时添加对应 JSON 文件即可。
const modules = import.meta.glob<Record<string, unknown>>('./*/*.json', {
  eager: true,
  import: 'default',
})
const resources: Resource = {}
for (const [path, content] of Object.entries(modules)) {
  const match = /^\.\/([^/]+)\/([^/]+)\.json$/.exec(path)
  if (!match) continue
  const [, lng, ns] = match
  ;(resources[lng!] ??= {})[ns!] = content
}

function applySideEffects(language: Language) {
  dayjs.locale(dayjsLocaleMap[language])
  document.documentElement.lang = language
}

const initial = useLocaleStore.getState().language

void i18n.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: LANGUAGES.map((l) => l.value),
  ns: [
    'common',
    'error',
    'layout',
    'auth',
    'system',
    'dashboard',
    'components',
    'master',
    'infant',
    'forecast',
  ],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  initAsync: false,
})
applySideEffects(initial)

/**
 * 统一的语言切换入口
 *
 * 同步更新 i18next、Day.js、HTML lang 属性和 Zustand 语言状态。
 */
export async function changeLanguage(language: Language) {
  await i18n.changeLanguage(language)
  applySideEffects(language)
  useLocaleStore.setState({ language })
}

export default i18n
