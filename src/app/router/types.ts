import type { ComponentType, ReactNode } from 'react'
import type { RouteTitleKey } from '@/shared/types/route'

export interface AppRoute {
  /** Relative segment, e.g. 'users'. Full path is derived from nesting. */
  path: string
  titleKey: RouteTitleKey
  icon?: ReactNode
  permission?: string
  hideInMenu?: boolean
  /** Lazy page component (leaf routes). */
  lazy?: () => Promise<{ default: ComponentType }>
  children?: AppRoute[]
}
