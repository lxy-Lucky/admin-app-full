import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Layout, theme } from 'antd'
import { useTranslation } from 'react-i18next'
import { Outlet, useMatches } from 'react-router'
import { hasPermission, useAuthStore } from '@/features/auth'
import { ForbiddenPage } from '@/features/error'
import { env } from '@/shared/config/env'
import type { RouteHandle } from '@/shared/types/route'
import { useThemeStore } from '@/theme'
import styles from './BasicLayout.module.scss'
import HeaderActions from './HeaderActions'
import LayoutBreadcrumb from './LayoutBreadcrumb'
import SideMenu from './SideMenu'
import { useLayoutStore } from './store'

const SIDER_WIDTH = 220

export default function BasicLayout() {
  const { t } = useTranslation('layout')
  const { token } = theme.useToken()
  const mode = useThemeStore((s) => s.mode)
  const { collapsed, toggle } = useLayoutStore()
  const permissions = useAuthStore((s) => s.permissions)
  const matches = useMatches()

  // Route permission (inherited from parents) is enforced here, in one place.
  const forbidden = matches.some(
    (m) => !hasPermission(permissions, (m.handle as RouteHandle | undefined)?.permission),
  )

  return (
    <Layout className={styles.root}>
      <Layout.Sider
        theme={mode}
        width={SIDER_WIDTH}
        collapsed={collapsed}
        trigger={null}
        collapsible
        className={styles.sider}
      >
        <div className={styles.logo}>
          {collapsed ? env.VITE_APP_TITLE.slice(0, 1) : env.VITE_APP_TITLE}
        </div>
        <SideMenu />
      </Layout.Sider>
      <Layout>
        <Layout.Header className={styles.header} style={{ background: token.colorBgContainer }}>
          <Button
            type="text"
            aria-label={t('header.toggleMenu')}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggle}
          />
          <LayoutBreadcrumb />
          <div className={styles.actions}>
            <HeaderActions />
          </div>
        </Layout.Header>
        <Layout.Content className={styles.content}>
          {forbidden ? <ForbiddenPage fullPage={false} /> : <Outlet />}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
