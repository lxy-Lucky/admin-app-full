import type { ReactNode } from 'react'
import type { RouteTitleKey } from '@/shared/types/route'

export interface Shortcut {
  to: string
  titleKey: RouteTitleKey
  icon: ReactNode
  /** Hidden when the user lacks this permission code. */
  permission?: string
}
