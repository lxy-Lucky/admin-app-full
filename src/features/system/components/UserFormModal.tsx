import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Form, Input, Select } from 'antd'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormField, FormModal } from '@/shared/components'
import { userApi } from '../api'
import { useRoles } from '../hooks'
import { userKeys } from '../keys'
import { userSchema, type UserFormValues } from '../schema'
import type { User } from '../types'

interface Props {
  /** Editing this user; undefined = create. */
  user?: User
  onClose: () => void
}

/** Mount it only while open: each mount starts from fresh form state. */
export default function UserFormModal({ user, onClose }: Props) {
  const { t } = useTranslation('system')
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const roles = useRoles()
  const formId = useId()

  const { control, handleSubmit } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          username: user.username,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          status: user.status,
        }
      : { username: '', name: '', email: '', roleId: undefined, status: 'enabled' },
  })

  const save = useMutation({
    mutationFn: (values: UserFormValues) =>
      user ? userApi.update(user.id, values) : userApi.create(values),
    onSuccess: async () => {
      void message.success(t('message.saved'))
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      onClose()
    },
  })

  return (
    <FormModal
      open
      formId={formId}
      title={user ? t('users.edit') : t('users.add')}
      confirmLoading={save.isPending}
      onCancel={onClose}
    >
      <Form
        id={formId}
        layout="vertical"
        onFinish={() => void handleSubmit((values) => save.mutate(values))()}
      >
        <FormField control={control} name="username" label={t('users.username')} required>
          {(field) => <Input {...field} disabled={!!user} />}
        </FormField>
        <FormField control={control} name="name" label={t('users.name')} required>
          {(field) => <Input {...field} />}
        </FormField>
        <FormField control={control} name="email" label={t('users.email')} required>
          {(field) => <Input {...field} />}
        </FormField>
        <FormField control={control} name="roleId" label={t('users.role')} required>
          {(field) => (
            <Select
              {...field}
              loading={roles.isLoading}
              options={roles.data?.map((r) => ({ value: r.id, label: r.name }))}
            />
          )}
        </FormField>
        <FormField control={control} name="status" label={t('users.status')}>
          {(field) => (
            <Select
              {...field}
              options={[
                { value: 'enabled', label: t('status.enabled') },
                { value: 'disabled', label: t('status.disabled') },
              ]}
            />
          )}
        </FormField>
      </Form>
    </FormModal>
  )
}
