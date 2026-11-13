import { Popconfirm } from 'antd'
import type { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ConfirmActionProps {
  /** 确认弹窗标题，默认使用通用删除提示。 */
  title?: ReactNode
  /** 确认操作回调，支持返回 Promise，完成前确认按钮会显示加载状态。 */
  onConfirm: () => unknown
  /** 触发确认弹窗的子元素，必须是单个 React 元素。 */
  children: ReactElement
}

/**
 * 通用操作确认组件。
 *
 * 统一确认和取消按钮的国际化文案及危险操作样式，
 * 主要用于删除等不可轻易撤销的行级操作。
 */
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
