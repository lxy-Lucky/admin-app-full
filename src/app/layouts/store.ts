import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  collapsed: boolean
  toggle: () => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: 'app-layout' },
  ),
)
