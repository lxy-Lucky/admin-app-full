import dayjs from 'dayjs'
import i18n, { type Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANGUAGE, LANGUAGES, dayjsLocaleMap, type Language } from './config'
import { useLocaleStore } from './store'

export * from './config'
export { useLocaleStore } from './store'

// ./<lng>/<ns>.json -> resources[lng][ns]; add a language or namespace by adding files.
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
  ns: ['common', 'error', 'layout', 'auth', 'system', 'dashboard'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  initAsync: false,
})
applySideEffects(initial)

/** Single entry point for switching language: i18next + dayjs + <html lang> + persisted store. */
export async function changeLanguage(language: Language) {
  await i18n.changeLanguage(language)
  applySideEffects(language)
  useLocaleStore.setState({ language })
}

export default i18n
