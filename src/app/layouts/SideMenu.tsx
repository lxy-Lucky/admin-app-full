import { Menu } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { hasPermission, useAuthStore } from '@/features/auth'
import { useThemeStore } from '@/theme'
import { buildMenuItems, findSelectedKey, getOpenKeys } from '../router/menu'
import { menuRoutes } from '../router/menu-routes'

export default function SideMenu() {
  const { t } = useTranslation('layout')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const permissions = useAuthStore((s) => s.permissions)
  const mode = useThemeStore((s) => s.mode)

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
    <Menu
      theme={mode}
      mode="inline"
      items={items}
      selectedKeys={selectedKey ? [selectedKey] : []}
      defaultOpenKeys={getOpenKeys(pathname)}
      onClick={({ key }) => void navigate(key)}
    />
  )
}
