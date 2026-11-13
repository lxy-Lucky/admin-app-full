import { Modal } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface FormModalProps {
  /** 是否显示弹窗。 */
  open: boolean
  /** 弹窗标题。 */
  title: ReactNode
  /** 内部表单的 ID，确认按钮通过该 ID 触发表单提交。 */
  formId: string
  /** 确认按钮的加载状态，通常绑定表单提交状态。 */
  confirmLoading?: boolean
  /** 关闭或取消弹窗时的回调。 */
  onCancel: () => void
  /** 弹窗主体内容，通常包含 form 元素。 */
  children: ReactNode
}

/**
 * 通用表单弹窗组件。
 *
 * 统一弹窗宽度、确认与取消按钮的国际化文案及关闭行为。
 * 确认按钮通过 form 属性关联内部表单，点击后触发表单提交。
 */
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
