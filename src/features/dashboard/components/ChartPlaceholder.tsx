import { Card, Empty } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/** Reserved slot for a chart. Replace the <Empty /> with a chart, or delete the whole card. */
export default function ChartPlaceholder({
  title,
  height = 280,
}: {
  title: ReactNode
  height?: number
}) {
  const { t } = useTranslation('dashboard')
  return (
    <Card title={title}>
      <div style={{ height, display: 'grid', placeItems: 'center' }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('charts.placeholder')} />
      </div>
    </Card>
  )
}
