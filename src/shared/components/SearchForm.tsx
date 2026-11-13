import { Button, Checkbox, Collapse, Flex, Form, Input, Radio, Select } from 'antd'
import type { ReactNode } from 'react'
import {
  Controller,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

/** 搜索选项，供下拉框、单选框和多选框组使用。 */
export interface SearchFieldOption {
  value: string | number
  label: ReactNode
}

/**
 * 搜索字段配置。
 *
 * 通过配置描述字段名称、展示标签、控件类型和可选项，
 * 无需为每个页面单独编写搜索表单 JSX。
 */
export interface SearchField {
  /** 表单字段名，同时也是 onSearch 参数中的属性名。 */
  name: string
  /** 字段展示标签；checkbox 类型会将标签放在复选框旁边。 */
  label: ReactNode
  /** 搜索控件类型。 */
  kind: 'text' | 'select' | 'radio' | 'checkbox' | 'checkboxGroup'
  /** 下拉框、单选框和多选框组的选项配置。 */
  options?: SearchFieldOption[]
  /** 输入框或选择器的占位提示。 */
  placeholder?: string
  /** 字段容器宽度，支持像素数值或 CSS 长度。 */
  width?: number | string
}

interface SearchFormProps<T extends FieldValues> {
  /** 搜索字段配置列表。 */
  fields: SearchField[]
  /** 表单初始值及重置时恢复的值。 */
  defaultValues: T
  /** 点击搜索或重置时触发，接收完整表单值。 */
  onSearch: (values: T) => void
}

/**
 * 配置驱动的通用搜索表单。
 *
 * 使用 React Hook Form 管理字段状态，
 * 根据字段配置动态渲染 Ant Design 控件，
 * 支持展开/收起、提交搜索和恢复默认条件。
 */
export default function SearchForm<T extends FieldValues>({
  fields,
  defaultValues,
  onSearch,
}: SearchFormProps<T>) {
  const { t } = useTranslation()
  const { control, handleSubmit, reset } = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>,
  })

  // 根据字段类型将 RHF 字段状态映射为对应的 Ant Design 控件。
  const renderControl = (
    field: SearchField,
    rhf: { value: unknown; onChange: (v: unknown) => void },
  ) => {
    switch (field.kind) {
      case 'text':
        return (
          <Input
            value={rhf.value as string}
            placeholder={field.placeholder}
            onChange={(e) => rhf.onChange(e.target.value)}
          />
        )
      case 'select':
        return (
          <Select
            allowClear
            value={rhf.value as string | number | undefined}
            options={field.options}
            placeholder={field.placeholder}
            onChange={rhf.onChange}
          />
        )
      case 'radio':
        return (
          <Radio.Group
            value={rhf.value}
            options={field.options}
            onChange={(e) => rhf.onChange(e.target.value)}
          />
        )
      case 'checkbox':
        return (
          <Checkbox checked={!!rhf.value} onChange={(e) => rhf.onChange(e.target.checked)}>
            {field.label}
          </Checkbox>
        )
      case 'checkboxGroup':
        return (
          <Checkbox.Group
            value={rhf.value as (string | number)[]}
            options={field.options}
            onChange={rhf.onChange}
          />
        )
    }
  }

  return (
    <Collapse
      defaultActiveKey={['search']}
      items={[
        {
          key: 'search',
          label: t('search.condition'),
          children: (
            <Form layout="vertical" onFinish={() => void handleSubmit((v) => onSearch(v as T))()}>
              <Flex wrap gap={16}>
                {fields.map((field) => (
                  <div key={field.name} style={{ width: field.width ?? 'auto', minWidth: 120 }}>
                    <Controller
                      name={field.name as Path<T>}
                      control={control}
                      render={({ field: rhf }) => (
                        <Form.Item label={field.kind === 'checkbox' ? ' ' : field.label}>
                          {renderControl(field, rhf)}
                        </Form.Item>
                      )}
                    />
                  </div>
                ))}
              </Flex>
              <Flex gap={8}>
                <Button type="primary" htmlType="submit">
                  {t('actions.search')}
                </Button>
                <Button
                  onClick={() => {
                    reset(defaultValues as DefaultValues<T>)
                    onSearch(defaultValues)
                  }}
                >
                  {t('actions.reset')}
                </Button>
              </Flex>
            </Form>
          ),
        },
      ]}
    />
  )
}
