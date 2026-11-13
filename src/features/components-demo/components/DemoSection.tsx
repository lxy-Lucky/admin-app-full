import { Card, Collapse, Typography, theme } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  title: ReactNode
  description?: ReactNode
  /** Source snippet shown in a collapsible block under the demo. */
  code?: string
  children: ReactNode
}

/** One demo block: title, description, live preview and a collapsible code snippet. */
export default function DemoSection({ title, description, code, children }: Props) {
  const { t } = useTranslation('components')
  const { token } = theme.useToken()

  return (
    <Card title={title}>
      {description && <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>}
      {children}
      {code && (
        <Collapse
          ghost
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'code',
              label: t('showCode'),
              children: (
                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    overflow: 'auto',
                    fontSize: 12,
                    borderRadius: token.borderRadius,
                    background: token.colorFillQuaternary,
                  }}
                >
                  <code>{code}</code>
                </pre>
              ),
            },
          ]}
        />
      )}
    </Card>
  )
}
