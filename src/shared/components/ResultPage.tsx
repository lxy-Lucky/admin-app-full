import { Button, Result, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

/** 支持展示的错误页面状态。 */
export type ResultStatus = '403' | '404' | '500'

interface Props {
  /** 错误状态码，决定页面展示的标题和说明。 */
  status: ResultStatus
  /** 是否占满视口高度；false 时作为普通容器内容展示。 */
  fullPage?: boolean
  /** 可选的错误详情，通常用于展示调试信息。 */
  detail?: string
}

/**
 * 统一错误结果页面。
 *
 * 根据错误状态展示对应的说明和操作按钮，
 * 支持独立全屏展示或嵌入现有页面容器。
 */
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
