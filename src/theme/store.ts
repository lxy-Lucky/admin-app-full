import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PRIMARY_COLOR, type ThemeMode } from './config'

/**
 * 主题状态管理
 *
 * 使用 Zustand 管理主题模式和主色，
 * 并将用户的主题偏好持久化到本地存储。
 */
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
      // 仅持久化用户主题偏好，不保存操作方法。
      partialize: (s) => ({ mode: s.mode, primaryColor: s.primaryColor }),
    },
  ),
)
