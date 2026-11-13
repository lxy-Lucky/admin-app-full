import { Form } from 'antd'
import { useId, type ReactElement, type ReactNode } from 'react'
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { translateError } from '@/shared/utils/form'

interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  /** React Hook Form 表单控制对象。 */
  control: Control<T>
  /** 当前字段在表单数据中的路径，支持嵌套字段。 */
  name: N
  /** 表单项标签。 */
  label?: ReactNode
  /** 是否显示必填标记，实际校验规则由 Zod Schema 定义。 */
  required?: boolean
  /** 表单项下方的补充说明。 */
  extra?: ReactNode
  /** 自定义渲染输入控件，并接收 React Hook Form 提供的字段属性。 */
  children: (field: ControllerRenderProps<T, N>) => ReactElement
}

/**
 * 通用表单字段组件。
 *
 * 通过 React Hook Form Controller 接管字段状态，
 * 使用 Ant Design Form.Item 统一管理标签、必填标记和错误展示，
 * 并将 Zod 校验错误转换为国际化提示。
 */
export default function FormField<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  control,
  name,
  label,
  required,
  extra,
  children,
}: FormFieldProps<T, N>) {
  const { t } = useTranslation()
  const id = `${useId()}-${name}`
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          label={label}
          htmlFor={id}
          required={required}
          extra={extra}
          validateStatus={fieldState.error ? 'error' : undefined}
          help={translateError(t, fieldState.error?.message)}
        >
          {children({ ...field, id } as ControllerRenderProps<T, N>)}
        </Form.Item>
      )}
    />
  )
}
