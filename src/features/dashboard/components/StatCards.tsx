import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic, theme } from 'antd'
import { useTranslation } from 'react-i18next'
import { useOverview } from '../hooks'
import type { OverviewCard } from '../types'

const CARD_KEYS: OverviewCard['key'][] = ['users', 'enabledUsers', 'roles', 'requests']

function Trend({ value }: { value: number }) {
  const { t } = useTranslation('dashboard')
  const { token } = theme.useToken()
  const color =
    value > 0 ? token.colorSuccess : value < 0 ? token.colorError : token.colorTextSecondary
  const Icon = value > 0 ? ArrowUpOutlined : value < 0 ? ArrowDownOutlined : MinusOutlined
  return (
    <span style={{ color, fontSize: token.fontSizeSM }}>
      <Icon /> {Math.abs(value)}%{' '}
      <span style={{ color: token.colorTextSecondary }}>{t('vsLastPeriod')}</span>
    </span>
  )
}

export default function StatCards() {
  const { t } = useTranslation('dashboard')
  const overview = useOverview()

  return (
    <Row gutter={[16, 16]}>
      {CARD_KEYS.map((key) => {
        const card = overview.data?.cards.find((c) => c.key === key)
        return (
          <Col key={key} xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title={t(`cards.${key}`)}
                value={card?.value ?? '-'}
                loading={overview.isLoading}
              />
              {card && <Trend value={card.trend} />}
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}
