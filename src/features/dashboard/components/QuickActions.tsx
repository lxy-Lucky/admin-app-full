import { Button, Card, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from '@/features/auth'
import { shortcuts } from '../shortcut-items'

export default function QuickActions() {
  const { t } = useTranslation('dashboard')
  const { t: tl } = useTranslation('layout')
  const { can } = useAuth()
  const visible = shortcuts.filter((s) => can(s.permission))
  if (visible.length === 0) return null

  return (
    <Card title={t('quickActions')}>
      <Space wrap>
        {visible.map((s) => (
          <Link key={s.to} to={s.to}>
            <Button icon={s.icon}>{tl(s.titleKey)}</Button>
          </Link>
        ))}
      </Space>
    </Card>
  )
}
