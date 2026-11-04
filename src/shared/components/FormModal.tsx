import { Modal } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface FormModalProps {
  open: boolean
  title: ReactNode
  /** Id of the <form> inside; the OK button submits it. */
  formId: string
  confirmLoading?: boolean
  onCancel: () => void
  children: ReactNode
}

/** Modal whose OK button submits the form it contains (`<form id={formId}>`). */
export default function FormModal({
  open,
  title,
  formId,
  confirmLoading,
  onCancel,
  children,
}: FormModalProps) {
  const { t } = useTranslation()
  return (
    <Modal
      open={open}
      title={title}
      width={520}
      mask={{ closable: false }}
      destroyOnHidden
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      okText={t('actions.confirm')}
      cancelText={t('actions.cancel')}
      okButtonProps={{ htmlType: 'submit', form: formId }}
    >
      {children}
    </Modal>
  )
}
