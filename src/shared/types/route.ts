import type { ParseKeys } from 'i18next'

/**
 * 路由相关类型定义
 *
 * 统一管理路由标题国际化 Key 和路由元数据类型。
 */

/** 路由标题对应的 layout 命名空间国际化 Key。 */
export type RouteTitleKey = ParseKeys<'layout'>

/**
 * 路由元数据类型，通过 route.handle 配置，
 * 可使用 useMatches() 获取当前匹配路由的元数据。
 */
export interface RouteHandle {
  /** 路由标题国际化 Key，用于菜单和面包屑展示。 */
  titleKey?: RouteTitleKey

  /** 访问该路由所需的权限标识，子路由可继承父路由权限。 */
  permission?: string
}
