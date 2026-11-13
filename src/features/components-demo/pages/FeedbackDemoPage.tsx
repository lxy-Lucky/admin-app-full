import { App, Button, Empty, Segmented, Skeleton, Space, Spin } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmAction, ResultPage, type ResultStatus } from '@/shared/components'
import DemoSection from '../components/DemoSection'

export default function FeedbackDemoPage() {
  const { t } = useTranslation('components')
  const { t: tc } = useTranslation()
  const { message, modal, notification } = App.useApp()
  const [status, setStatus] = useState<ResultStatus>('404')

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <DemoSection
        title={t('feedback.confirmTitle')}
        description={t('feedback.confirmDesc')}
        code={`<ConfirmAction onConfirm={() => remove.mutateAsync(id)}>
  <Button danger>Delete</Button>
</ConfirmAction>`}
      >
        <ConfirmAction
          onConfirm={() =>
            new Promise<void>((resolve) =>
              setTimeout(() => {
                void message.success(t('feedback.confirmDone'))
                resolve()
              }, 800),
            )
          }
        >
          <Button danger>{t('feedback.confirmButton')}</Button>
        </ConfirmAction>
      </DemoSection>

      <DemoSection
        title={t('feedback.messageTitle')}
        description={t('feedback.messageDesc')}
        code={`const { message } = App.useApp()
message.success('...')`}
      >
        <Space wrap>
          {(['success', 'error', 'warning', 'info', 'loading'] as const).map((type) => (
            <Button key={type} onClick={() => void message[type](t('feedback.messageText'))}>
              {t(`feedback.${type}`)}
            </Button>
          ))}
        </Space>
      </DemoSection>

      <DemoSection
        title={t('feedback.modalTitle')}
        description={t('feedback.modalDesc')}
        code={`const { modal } = App.useApp()
modal.confirm({ title: '...', content: '...', onOk })`}
      >
        <Button
          onClick={() =>
            modal.confirm({
              title: t('feedback.modalHeader'),
              content: t('feedback.modalContent'),
              okText: tc('actions.confirm'),
              cancelText: tc('actions.cancel'),
            })
          }
        >
          {t('feedback.openModal')}
        </Button>
      </DemoSection>

      <DemoSection
        title={t('feedback.notifyTitle')}
        description={t('feedback.notifyDesc')}
        code={`const { notification } = App.useApp()
notification.info({ message: '...', description: '...' })`}
      >
        <Button
          onClick={() =>
            notification.info({
              message: t('feedback.notifyMessage'),
              description: t('feedback.notifyContent'),
            })
          }
        >
          {t('feedback.notifyButton')}
        </Button>
      </DemoSection>

      <DemoSection
        title={t('feedback.resultTitle')}
        description={t('feedback.resultDesc')}
        code={`<ResultPage status="404" fullPage={false} />`}
      >
        <Segmented<ResultStatus>
          value={status}
          options={['403', '404', '500']}
          onChange={setStatus}
        />
        <ResultPage status={status} fullPage={false} />
      </DemoSection>

      <DemoSection
        title={t('feedback.emptyTitle')}
        description={t('feedback.emptyDesc')}
        code={`<Empty /> <Spin /> <Skeleton active />`}
      >
        <Space size={48} align="start" wrap>
          <Empty />
          <Spin size="large" />
          <Skeleton active style={{ width: 240 }} />
        </Space>
      </DemoSection>
    </Space>
  )
}
