import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_LANGUAGE, type Language } from './config'

interface LocaleState {
  language: Language
}

export const useLocaleStore = create<LocaleState>()(
  persist(() => ({ language: DEFAULT_LANGUAGE }), { name: 'app-locale' }),
)
