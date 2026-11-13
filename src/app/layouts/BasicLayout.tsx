import { useTranslation } from 'react-i18next'
import { Link, Outlet, useMatches } from 'react-router'
import { hasPermission, useAuthStore } from '@/features/auth'
import { ForbiddenPage } from '@/features/error'
import { env } from '@/shared/config/env'
import type { RouteHandle } from '@/shared/types/route'
import styles from './BasicLayout.module.scss'
import HeaderActions from './HeaderActions'
import SideMenu from './SideMenu'
import SubHeader from './SubHeader'

/**
 * 基础布局
 *
 * 包含顶部导航、侧边菜单、子页面导航和主内容区域。
 * 统一处理路由权限校验，无权限时展示 403 页面。
 */
export default function BasicLayout() {
  const { t } = useTranslation('layout')
  const permissions = useAuthStore((s) => s.permissions)
  const matches = useMatches()

  // 统一校验当前匹配路由及其父级路由的权限
  const forbidden = matches.some(
    (m) => !hasPermission(permissions, (m.handle as RouteHandle | undefined)?.permission),
  )

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link to="/" className={styles.title} aria-label={t('header.home')}>
          {env.VITE_APP_TITLE}
        </Link>
        <HeaderActions />
      </header>
      <div className={styles.body}>
        <div className={styles.nav}>
          <SideMenu />
        </div>
        <div className={styles.right}>
          <SubHeader />
          <main className={styles.content}>
            {forbidden ? <ForbiddenPage fullPage={false} /> : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  )
}
