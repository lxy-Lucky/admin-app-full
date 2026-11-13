import { ConfigProvider, Menu } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { hasPermission, useAuthStore } from '@/features/auth'
import { buildMenuItems, findSelectedKey } from '../router/menu'
import { menuRoutes } from '../router/menu-routes'

const MENU_ITEM_HEIGHT = 60

/**
 * 侧边导航菜单
 *
 * 使用深色纵向菜单，支持悬停展开子菜单、
 * 根据用户权限动态过滤菜单项。
 */
export default function SideMenu() {
  const { t } = useTranslation('layout')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const permissions = useAuthStore((s) => s.permissions)

  // 根据路由配置、国际化和用户权限动态生成菜单项
  const items = useMemo(
    () =>
      buildMenuItems(
        menuRoutes,
        (key) => t(key),
        (p) => hasPermission(permissions, p),
      ),
    [t, permissions],
  )
  const selectedKey = findSelectedKey(items, pathname)

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemHeight: MENU_ITEM_HEIGHT,
            itemBorderRadius: 0,
            itemMarginInline: 0,
            itemMarginBlock: 0,
            darkItemSelectedBg: '#444746',
            darkItemSelectedColor: '#fff',
            darkItemBg: '#242424',
            darkSubMenuItemBg: '#242424',
            darkPopupBg: '#242424',
            darkItemHoverBg: '#444746',
            darkItemColor: '#d6dfeb',
          },
        },
      }}
    >
      <Menu
        theme="dark"
        mode="vertical"
        triggerSubMenuAction="hover"
        items={items}
        selectedKeys={selectedKey ? [selectedKey] : []}
        style={{ borderInlineEnd: 0, width: '100%' }}
        onClick={({ key }) => void navigate(key)}
      />
    </ConfigProvider>
  )
}
