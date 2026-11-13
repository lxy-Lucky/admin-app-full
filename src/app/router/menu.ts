import type { MenuProps } from 'antd'
import type { RouteTitleKey } from '@/shared/types/route'
import type { AppRoute } from './types'

export type MenuItems = NonNullable<MenuProps['items']>
type MenuItem = MenuItems[number]

/**
 * 根据路由配置生成侧边栏菜单。
 *
 * 自动过滤无权限或隐藏的路由，并移除没有可见子菜单的父级菜单。
 */
export function buildMenuItems(
  routes: AppRoute[],
  t: (key: RouteTitleKey) => string,
  can: (permission?: string) => boolean,
  base = '',
): MenuItems {
  return routes.flatMap((r): MenuItem[] => {
    if (r.hideInMenu || !can(r.permission)) return []
    const key = `${base}/${r.path}`
    if (r.children?.length) {
      const children = buildMenuItems(r.children, t, can, key)
      return children.length ? [{ key, icon: r.icon, label: t(r.titleKey), children }] : []
    }
    return [{ key, icon: r.icon, label: t(r.titleKey) }]
  })
}

function leafKeys(items: MenuItems): string[] {
  return items.flatMap((item) => {
    if (!item || !('key' in item)) return []
    const children = 'children' in item ? (item.children as MenuItems | undefined) : undefined
    return children ? leafKeys(children) : [String(item.key)]
  })
}

/**
 * 根据当前路径查找选中的菜单项。
 *
 * 优先匹配路径最长的菜单项，确保详情页等嵌套路由能够正确选中父级菜单。
 */
export function findSelectedKey(items: MenuItems, pathname: string): string | undefined {
  return leafKeys(items)
    .filter((key) => pathname === key || pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0]
}

/**
 * 根据当前路径生成需要展开的父级菜单 Key。
 *
 * 例如：/system/users -> ['/system']
 */
export function getOpenKeys(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  return segments.slice(0, -1).map((_, i) => `/${segments.slice(0, i + 1).join('/')}`)
}
