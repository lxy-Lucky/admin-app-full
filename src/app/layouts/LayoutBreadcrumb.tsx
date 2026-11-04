import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useMatches } from 'react-router'
import type { RouteHandle } from '@/shared/types/route'

export default function LayoutBreadcrumb() {
  const { t } = useTranslation('layout')
  const matches = useMatches()
  const crumbs = matches.flatMap((m) => {
    const key = (m.handle as RouteHandle | undefined)?.titleKey
    return key ? [{ title: t(key) }] : []
  })
  return (
    <Breadcrumb
      items={[
        {
          title: (
            <Link to="/" aria-label={t('header.home')}>
              <HomeOutlined />
            </Link>
          ),
        },
        ...crumbs,
      ]}
    />
  )
}
