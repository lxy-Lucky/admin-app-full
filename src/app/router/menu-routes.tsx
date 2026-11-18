import {
  AppstoreOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { AppRoute } from './types'

/**
 * 全局路由配置
 *
 * 统一管理页面路由、侧边栏菜单、面包屑标题和访问权限。
 * 同时定义各页面的懒加载入口。
 */
export const menuRoutes: AppRoute[] = [
  {
    path: 'home',
    titleKey: 'menu.home',
    hideInMenu: true,
    icon: <DashboardOutlined />,
    lazy: () => import('@/features/home/pages/HomePage'),
  },
  {
    path: 'master',
    titleKey: 'menu.master',
    icon: <DatabaseOutlined />,
    children: [
      {
        path: 'juki-db',
        titleKey: 'menu.jukiDb',
        lazy: () => import('@/features/master/pages/JukiDbPage'),
      },
      {
        path: 'school-area-info',
        titleKey: 'menu.schoolAreaInfo',
        lazy: () => import('@/features/master/pages/SchoolAreaInfoPage'),
      },
      {
        path: 'gakuseki-db',
        titleKey: 'menu.gakusekiDb',
        lazy: () => import('@/features/master/pages/GakusekiDbPage'),
      },
      {
        path: 'school',
        titleKey: 'menu.schoolMaster',
        lazy: () => import('@/features/master/pages/SchoolPage'),
      },
    ],
  },
  {
    path: 'components',
    titleKey: 'menu.components',
    icon: <AppstoreOutlined />,
    children: [
      {
        path: 'form',
        titleKey: 'menu.demoForm',
        lazy: () => import('@/features/components-demo/pages/FormDemoPage'),
      },
      {
        path: 'table',
        titleKey: 'menu.demoTable',
        lazy: () => import('@/features/components-demo/pages/TableDemoPage'),
      },
      {
        path: 'inputs',
        titleKey: 'menu.demoInputs',
        lazy: () => import('@/features/components-demo/pages/InputsDemoPage'),
      },
      {
        path: 'feedback',
        titleKey: 'menu.demoFeedback',
        lazy: () => import('@/features/components-demo/pages/FeedbackDemoPage'),
      },
      {
        path: 'buttons',
        titleKey: 'menu.demoButtons',
        lazy: () => import('@/features/components-demo/pages/ButtonsDemoPage'),
      },
    ],
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
