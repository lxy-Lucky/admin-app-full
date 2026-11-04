import { Card } from 'antd'
import { useTranslation } from 'react-i18next'
import { useMatches } from 'react-router'
import type { RouteHandle } from '@/shared/types/route'

/** Temporary page body: shows the current route title. */
export default function PagePlaceholder() {
  const { t } = useTranslation()
  const matches = useMatches()
  const titleKey = [...matches]
    .reverse()
    .find((m) => (m.handle as RouteHandle | undefined)?.titleKey)?.handle as RouteHandle | undefined
  return (
    <Card title={titleKey?.titleKey ? t(titleKey.titleKey, { ns: 'layout' }) : undefined}>
      {t('placeholder')}
    </Card>
  )
}
