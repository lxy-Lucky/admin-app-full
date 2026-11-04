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
  control: Control<T>
  name: N
  label?: ReactNode
  /** Only draws the asterisk; validation lives in the Zod schema. */
  required?: boolean
  extra?: ReactNode
  /** Render the AntD control: `{(field) => <Input {...field} />}` */
  children: (field: ControllerRenderProps<T, N>) => ReactElement
}

/** RHF Controller + AntD Form.Item: label wiring, error status and translated Zod messages. */
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
