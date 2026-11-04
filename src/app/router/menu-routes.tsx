import { DashboardOutlined, SettingOutlined } from '@ant-design/icons'
import type { AppRoute } from './types'

/** Single source of truth for pages, sidebar menu, breadcrumbs and route permissions. */
export const menuRoutes: AppRoute[] = [
  {
    path: 'dashboard',
    titleKey: 'menu.dashboard',
    icon: <DashboardOutlined />,
    lazy: () => import('@/features/dashboard/pages/DashboardPage'),
  },
  {
    path: 'system',
    titleKey: 'menu.system',
    icon: <SettingOutlined />,
    children: [
      {
        path: 'users',
        titleKey: 'menu.users',
        permission: 'system:user:view',
        lazy: () => import('@/features/system/pages/UsersPage'),
      },
      {
        path: 'roles',
        titleKey: 'menu.roles',
        permission: 'system:role:view',
        lazy: () => import('@/features/system/pages/RolesPage'),
      },
    ],
  },
]
