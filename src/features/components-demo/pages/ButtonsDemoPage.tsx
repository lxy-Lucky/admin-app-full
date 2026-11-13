import { DownloadOutlined } from '@ant-design/icons'
import { Button, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { Auth, useAuth } from '@/features/auth'
import DemoSection from '../components/DemoSection'

export default function ButtonsDemoPage() {
  const { t } = useTranslation('components')
  const { can } = useAuth()

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <DemoSection
        title={t('buttons.typesTitle')}
        description={t('buttons.typesDesc')}
        code={`<Button type="primary">Primary</Button>
<Button>Default</Button>
<Button type="dashed">Dashed</Button>
<Button type="text">Text</Button>
<Button type="link">Link</Button>`}
      >
        <Space wrap>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
        </Space>
      </DemoSection>

      <DemoSection
        title={t('buttons.stateTitle')}
        description={t('buttons.stateDesc')}
        code={`<Button type="primary" danger>Danger</Button>
<Button type="primary" loading>Loading</Button>
<Button disabled>Disabled</Button>
<Button icon={<DownloadOutlined />}>Icon</Button>`}
      >
        <Space wrap>
          <Button type="primary" danger>
            {t('buttons.danger')}
          </Button>
          <Button type="primary" loading>
            {t('buttons.loading')}
          </Button>
          <Button disabled>{t('buttons.disabled')}</Button>
          <Button icon={<DownloadOutlined />}>{t('buttons.icon')}</Button>
          <Button size="large">Large</Button>
          <Button size="small">Small</Button>
        </Space>
      </DemoSection>

      <DemoSection
        title={t('buttons.authTitle')}
        description={t('buttons.authDesc')}
        code={`<Auth code="system:user:add" fallback={<span>no permission</span>}>
  <Button type="primary">Add</Button>
</Auth>

const { can } = useAuth()
if (can('system:user:add')) { ... }`}
      >
        <Space orientation="vertical">
          <Auth
            code="system:user:add"
            fallback={<Typography.Text type="secondary">{t('buttons.authDenied')}</Typography.Text>}
          >
            <Button type="primary">{t('buttons.authAllowed')}</Button>
          </Auth>
          <Typography.Text>
            {t('buttons.authCan')}
            {can('system:user:add') ? t('buttons.yes') : t('buttons.no')}
          </Typography.Text>
        </Space>
      </DemoSection>
    </Space>
  )
}
