import { UploadOutlined } from '@ant-design/icons'
import { Button, Modal, Typography, Upload, type UploadFile } from 'antd'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/** 单个导入文件的最大允许大小：100 MB。 */
const MAX_FILE_SIZE = 100 * 1024 * 1024

interface ImportModalProps {
  /** 弹窗标题。 */
  title: ReactNode
  /** 文件选择器允许的文件类型，例如 '.csv'、'.xlsx'。 */
  accept?: string
  /** 最大允许选择的文件数量，大于 1 时允许多选。 */
  maxCount?: number
  /** 确认按钮的加载状态，通常绑定文件导入请求状态。 */
  confirmLoading?: boolean
  /** 取消或关闭弹窗时的回调。 */
  onCancel: () => void
  /** 文件校验通过后触发，接收用户选择的原始文件。 */
  onSubmit: (files: File[]) => void
  /** 文件选择器上方的补充说明。 */
  children?: ReactNode
}

/**
 * 通用文件导入弹窗。
 *
 * 负责文件选择、数量限制、文件大小校验及错误提示，
 * 校验通过后将原始 File 对象交给业务层处理。
 * 组件每次挂载时都会初始化为空文件列表。
 */
export default function ImportModal({
  title,
  accept,
  maxCount = 1,
  confirmLoading,
  onCancel,
  onSubmit,
  children,
}: ImportModalProps) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [error, setError] = useState<string>()

  const submit = () => {
    // 提交前统一校验文件是否已选择，以及是否超过大小限制。
    if (files.length === 0) return setError(t('upload.required'))
    if (files.some((f) => (f.size ?? 0) > MAX_FILE_SIZE)) return setError(t('upload.tooLarge'))
    onSubmit(files.map((f) => f.originFileObj as File))
  }

  return (
    <Modal
      open
      title={title}
      width={520}
      mask={{ closable: false }}
      confirmLoading={confirmLoading}
      okText={t('actions.execute')}
      cancelText={t('actions.cancel')}
      onOk={submit}
      onCancel={onCancel}
    >
      {children}
      <Upload
        accept={accept}
        multiple={maxCount > 1}
        maxCount={maxCount}
        fileList={files}
        beforeUpload={() => false}
        onChange={({ fileList }) => {
          setFiles(fileList.slice(-maxCount))
          setError(undefined)
        }}
      >
        <Button icon={<UploadOutlined />}>{t('upload.select')}</Button>
      </Upload>
      {error && (
        <Typography.Text type="danger" role="alert" style={{ display: 'block', marginTop: 8 }}>
          {error}
        </Typography.Text>
      )}
    </Modal>
  )
}
