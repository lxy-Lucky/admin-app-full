import {
  AppstoreOutlined,
  BankOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ReadOutlined,
  SettingOutlined,
  TeamOutlined,
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
    path: 'dashboard',
    titleKey: 'menu.dashboard',
    hideInMenu: true,
    icon: <DashboardOutlined />,
    lazy: () => import('@/features/dashboard/pages/DashboardPage'),
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
    path: 'infant',
    titleKey: 'menu.infant',
    icon: <TeamOutlined />,
    children: [
      {
        path: 'fumei-area',
        titleKey: 'menu.fumeiArea',
        lazy: () => import('@/features/infant/pages/FumeiAreaPage'),
      },
      {
        path: 'summary1',
        titleKey: 'menu.summary1',
        lazy: () => import('@/features/infant/pages/Summary1Page'),
      },
      {
        path: 'anbun-toroku',
        titleKey: 'menu.anbunToroku',
        lazy: () => import('@/features/infant/pages/AnbunTorokuPage'),
      },
      {
        path: 'summary2',
        titleKey: 'menu.summary2',
        lazy: () => import('@/features/infant/pages/Summary2Page'),
      },
      {
        path: 'routine-anbun',
        titleKey: 'menu.routineAnbun',
        lazy: () => import('@/features/infant/pages/RoutineAnbunPage'),
      },
      {
        path: 'summary3',
        titleKey: 'menu.summary3',
        lazy: () => import('@/features/infant/pages/Summary3Page'),
      },
      {
        path: 'summary-rates',
        titleKey: 'menu.summaryRates',
        lazy: () => import('@/features/infant/pages/SummaryRatesPage'),
      },
    ],
  },
  {
    path: 'elem',
    titleKey: 'menu.elem',
    icon: <BankOutlined />,
    children: [
      {
        path: 'student-class',
        titleKey: 'menu.studentClass',
        lazy: () => import('@/features/forecast/pages/StudentClassPage'),
      },
      {
        path: 'change-rates',
        titleKey: 'menu.elemChangeRates',
        lazy: () => import('@/features/forecast/pages/ElemChangeRatesPage'),
      },
    ],
  },
  {
    path: 'jhs',
    titleKey: 'menu.jhs',
    icon: <ReadOutlined />,
    children: [
      {
        path: 'change-rates',
        titleKey: 'menu.jhsChangeRates',
        lazy: () => import('@/features/forecast/pages/JhsChangeRatesPage'),
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
