import { Col, Row, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth'
import ChartPlaceholder from '../components/ChartPlaceholder'
import QuickActions from '../components/QuickActions'
import StatCards from '../components/StatCards'

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const { user } = useAuth()

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t('welcome', { name: user?.name ?? '' })}
      </Typography.Title>

      <StatCards />

      {/* Chart area: reserved placeholders. Swap in real charts later, or delete this block. */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <ChartPlaceholder title={t('charts.trend')} />
        </Col>
        <Col xs={24} xl={8}>
          <ChartPlaceholder title={t('charts.distribution')} />
        </Col>
      </Row>

      <QuickActions />
    </Space>
  )
}
