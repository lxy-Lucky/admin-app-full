import { zodResolver } from '@hookform/resolvers/zod'
import { App, Button, Form, Input, Radio, Select, Space } from 'antd'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormField, FormModal } from '@/shared/components'
import DemoSection from '../components/DemoSection'

/** Messages are keys under `common:validation.*`; FormField translates them. */
const schema = z.object({
  username: z.string().trim().min(1, 'required'),
  email: z.string().trim().min(1, 'required').pipe(z.email('email')),
  role: z.string('required'),
  status: z.enum(['enabled', 'disabled']),
  remark: z.string().max(100).optional(),
})
type Values = z.infer<typeof schema>

const roleOptions = ['admin', 'editor', 'viewer'].map((value) => ({ value, label: value }))

const fieldsCode = `const { control, handleSubmit, reset } = useForm<Values>({
  resolver: zodResolver(schema),
  defaultValues: { username: '', email: '', status: 'enabled' },
})

<Form layout="vertical" onFinish={() => void handleSubmit(onValid)()}>
  <FormField control={control} name="username" label="Username" required>
    {(field) => <Input {...field} />}
  </FormField>
  <FormField control={control} name="role" label="Role" required>
    {(field) => <Select {...field} options={options} />}
  </FormField>
  <Button type="primary" htmlType="submit">Submit</Button>
</Form>`

const modalCode = `// Mount only while open: each open starts from a fresh form.
{open && (
  <FormModal open formId={formId} title="Add" onCancel={onClose}>
    <Form id={formId} layout="vertical" onFinish={...}>
      <FormField control={control} name="name" label="Name" required>
        {(field) => <Input {...field} />}
      </FormField>
    </Form>
  </FormModal>
)}`

function FieldsDemo() {
  const { t } = useTranslation('components')
  const { message } = App.useApp()
  const { control, handleSubmit, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', role: undefined, status: 'enabled', remark: '' },
  })

  return (
    <Form
      layout="vertical"
      style={{ maxWidth: 480 }}
      onFinish={() => void handleSubmit(() => void message.success(t('form.submitted')))()}
    >
      <FormField control={control} name="username" label={t('form.username')} required>
        {(field) => <Input {...field} />}
      </FormField>
      <FormField control={control} name="email" label={t('form.email')} required>
        {(field) => <Input {...field} />}
      </FormField>
      <FormField control={control} name="role" label={t('form.role')} required>
        {(field) => <Select {...field} options={roleOptions} />}
      </FormField>
      <FormField control={control} name="status" label={t('form.status')}>
        {(field) => (
          <Radio.Group
            {...field}
            options={[
              { value: 'enabled', label: t('form.enabled') },
              { value: 'disabled', label: t('form.disabled') },
            ]}
          />
        )}
      </FormField>
      <FormField
        control={control}
        name="remark"
        label={t('form.remark')}
        extra={t('form.remarkExtra')}
      >
        {(field) => <Input.TextArea {...field} rows={3} />}
      </FormField>
      <Space>
        <Button type="primary" htmlType="submit">
          {t('form.submit')}
        </Button>
        <Button onClick={() => reset()}>{t('form.reset')}</Button>
      </Space>
    </Form>
  )
}

const modalSchema = z.object({ name: z.string().trim().min(1, 'required') })
type ModalValues = z.infer<typeof modalSchema>

function ModalForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('components')
  const { message } = App.useApp()
  const formId = useId()
  const { control, handleSubmit } = useForm<ModalValues>({
    resolver: zodResolver(modalSchema),
    defaultValues: { name: '' },
  })

  return (
    <FormModal open formId={formId} title={t('form.modalHeader')} onCancel={onClose}>
      <Form
        id={formId}
        layout="vertical"
        onFinish={() =>
          void handleSubmit(() => {
            void message.success(t('form.submitted'))
            onClose()
          })()
        }
      >
        <FormField control={control} name="name" label={t('form.username')} required>
          {(field) => <Input {...field} />}
        </FormField>
      </Form>
    </FormModal>
  )
}

export default function FormDemoPage() {
  const { t } = useTranslation('components')
  const [open, setOpen] = useState(false)

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <DemoSection
        title={t('form.fieldsTitle')}
        description={t('form.fieldsDesc')}
        code={fieldsCode}
      >
        <FieldsDemo />
      </DemoSection>
      <DemoSection title={t('form.modalTitle')} description={t('form.modalDesc')} code={modalCode}>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('form.openModal')}
        </Button>
        {open && <ModalForm onClose={() => setOpen(false)} />}
      </DemoSection>
    </Space>
  )
}
