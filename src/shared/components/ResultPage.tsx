import { Button, Result, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

export type ResultStatus = '403' | '404' | '500'

interface Props {
  status: ResultStatus
  /** Fill the viewport (standalone route) instead of the surrounding container. */
  fullPage?: boolean
  detail?: string
}

export default function ResultPage({ status, fullPage = true, detail }: Props) {
  const { t } = useTranslation('error')
  const navigate = useNavigate()
  const subTitle = { '403': t('page.403'), '404': t('page.404'), '500': t('page.500') }[status]

  return (
    <div
      style={
        fullPage ? { display: 'grid', placeItems: 'center', minHeight: '100vh' } : { padding: 24 }
      }
    >
      <Result
        status={status}
        title={status}
        subTitle={subTitle}
        extra={
          <Space>
            <Button type="primary" onClick={() => void navigate('/', { replace: true })}>
              {t('backHome')}
            </Button>
            {status === '500' && (
              <Button onClick={() => window.location.reload()}>{t('reload')}</Button>
            )}
          </Space>
        }
      >
        {detail && <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>{detail}</pre>}
      </Result>
    </div>
  )
}
