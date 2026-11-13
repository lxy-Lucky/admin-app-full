import { Card } from 'antd'
import { useTranslation } from 'react-i18next'
import { useMatches } from 'react-router'
import type { RouteHandle } from '@/shared/types/route'

/**
 * 临时页面占位组件。
 *
 * 根据当前匹配路由读取页面标题，并展示统一的占位内容。
 * 用于业务页面尚未完成时临时承载路由。
 */
export default function PagePlaceholder() {
  const { t } = useTranslation()
  const matches = useMatches()
  // 从最深层匹配路由开始查找，优先使用当前页面自己的标题。
  const titleKey = [...matches]
    .reverse()
    .find((m) => (m.handle as RouteHandle | undefined)?.titleKey)?.handle as RouteHandle | undefined
  return (
    <Card title={titleKey?.titleKey ? t(titleKey.titleKey, { ns: 'layout' }) : undefined}>
      {t('placeholder')}
    </Card>
  )
}
