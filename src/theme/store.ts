import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PRIMARY_COLOR, type ThemeMode } from './config'

interface ThemeState {
  mode: ThemeMode
  primaryColor: string
  setMode: (mode: ThemeMode) => void
  setPrimaryColor: (color: string) => void
  reset: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      primaryColor: DEFAULT_PRIMARY_COLOR,
      setMode: (mode) => set({ mode }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      reset: () => set({ mode: 'light', primaryColor: DEFAULT_PRIMARY_COLOR }),
    }),
    {
      name: 'app-theme',
      partialize: (s) => ({ mode: s.mode, primaryColor: s.primaryColor }),
    },
  ),
)
