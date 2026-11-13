import { Spin } from 'antd'
import { Navigate, type RouteObject } from 'react-router'
import LoginPage from '@/features/auth/pages/LoginPage'
import { ForbiddenPage, NotFoundPage, ServerErrorPage } from '@/features/error'
import type { RouteHandle } from '@/shared/types/route'
import BasicLayout from '../layouts/BasicLayout'
import { AuthGuard, GuestGuard } from './guards'
import { menuRoutes } from './menu-routes'
import type { AppRoute } from './types'

/**
 * 将业务路由配置转换为 React Router 路由对象。
 *
 * 递归处理子路由，并将页面懒加载函数转换为 React Router 的 lazy 格式。
 */
function toRouteObject(route: AppRoute): RouteObject {
  const handle: RouteHandle = { titleKey: route.titleKey, permission: route.permission }
  if (route.children) {
    return { path: route.path, handle, children: route.children.map(toRouteObject) }
  }
  const loadPage = route.lazy
  return {
    path: route.path,
    handle,
    lazy: loadPage ? async () => ({ Component: (await loadPage()).default }) : undefined,
  } as RouteObject
}

/**
 * 应用路由配置
 *
 * 统一管理登录认证、基础布局、业务路由和异常页面。
 */
export const appRoutes: RouteObject[] = [
  {
    errorElement: <ServerErrorPage />,
    hydrateFallbackElement: (
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    ),
    children: [
      {
        path: '/login',
        element: (
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        ),
      },
      {
        path: '/',
        element: (
          <AuthGuard>
            <BasicLayout />
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          ...menuRoutes.map(toRouteObject),
        ],
      },
      { path: '/403', element: <ForbiddenPage /> },
      { path: '/500', element: <ServerErrorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
