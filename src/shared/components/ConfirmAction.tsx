import { Popconfirm } from 'antd'
import type { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ConfirmActionProps {
  /** Defaults to the generic delete question. */
  title?: ReactNode
  /** May return a promise: the confirm button shows a spinner until it settles. */
  onConfirm: () => unknown
  children: ReactElement
}

/** Popconfirm with project texts, for destructive row actions. */
export default function ConfirmAction({ title, onConfirm, children }: ConfirmActionProps) {
  const { t } = useTranslation()
  return (
    <Popconfirm
      title={title ?? t('confirm.delete')}
      okText={t('actions.confirm')}
      cancelText={t('actions.cancel')}
      okButtonProps={{ danger: true }}
      onConfirm={() => onConfirm() as Promise<unknown> | void}
    >
      {children}
    </Popconfirm>
  )
}
