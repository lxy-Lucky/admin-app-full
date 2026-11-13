import type { ComponentType, ReactNode } from 'react'
import type { RouteTitleKey } from '@/shared/types/route'

export interface AppRoute {
  /** 相对路径片段，例如 'users'，完整路径由路由层级组合生成 */
  path: string

  /** 路由标题国际化 Key */
  titleKey: RouteTitleKey

  /** 菜单图标 */
  icon?: ReactNode

  /** 访问该路由所需的权限标识 */
  permission?: string

  /** 是否在侧边栏菜单中隐藏 */
  hideInMenu?: boolean

  /** 页面懒加载组件，仅用于叶子路由 */
  lazy?: () => Promise<{ default: ComponentType }>

  /** 子路由配置 */
  children?: AppRoute[]
}
