import { PlusOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Input, Select, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Auth } from '@/features/auth'
import { ConfirmAction, DataTable } from '@/shared/components'
import { useTable } from '@/shared/hooks'
import { userApi } from '../api'
import UserFormModal from '../components/UserFormModal'
import { useRoles } from '../hooks'
import { userKeys } from '../keys'
import type { User, UserListParams } from '../types'

type Filters = Pick<UserListParams, 'keyword' | 'status' | 'roleId'>

export default function UsersPage() {
  const { t } = useTranslation('system')
  const { t: tc } = useTranslation()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const roles = useRoles()
  const [editing, setEditing] = useState<User | 'new' | null>(null)

  const table = useTable<User, Filters>({ queryKey: userKeys.lists(), fetcher: userApi.list })

  const remove = useMutation({
    mutationFn: userApi.remove,
    onSuccess: async () => {
      void message.success(t('message.deleted'))
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })

  const roleName = (id: number) => roles.data?.find((r) => r.id === id)?.name ?? id

  const columns: ColumnsType<User> = [
    { title: t('users.username'), dataIndex: 'username', key: 'username', sorter: true },
    { title: t('users.name'), dataIndex: 'name' },
    { title: t('users.email'), dataIndex: 'email' },
    { title: t('users.role'), dataIndex: 'roleId', render: roleName },
    {
      title: t('users.status'),
      dataIndex: 'status',
      render: (status: User['status']) => (
        <Tag color={status === 'enabled' ? 'success' : 'default'}>{t(`status.${status}`)}</Tag>
      ),
    },
    { title: t('users.createdAt'), dataIndex: 'createdAt', key: 'createdAt', sorter: true },
    {
      title: t('users.actions'),
      key: 'actions',
      fixed: 'right',
      render: (_, user) => (
        <Space size={0}>
          <Auth code="system:user:edit">
            <Button type="link" onClick={() => setEditing(user)}>
              {tc('actions.edit')}
            </Button>
          </Auth>
          <Auth code="system:user:delete">
            <ConfirmAction onConfirm={() => remove.mutateAsync(user.id)}>
              <Button type="link" danger>
                {tc('actions.delete')}
              </Button>
            </ConfirmAction>
          </Auth>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <DataTable<User>
        fillHeight
        rowKey="id"
        columns={columns}
        {...table.tableProps}
        filters={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder={t('users.search')}
              style={{ width: 280 }}
              onSearch={(keyword) => table.setFilters({ keyword: keyword.trim() || undefined })}
            />
            <Select
              allowClear
              placeholder={t('users.status')}
              style={{ width: 120 }}
              options={[
                { value: 'enabled', label: t('status.enabled') },
                { value: 'disabled', label: t('status.disabled') },
              ]}
              onChange={(status) => table.setFilters({ status })}
            />
            <Select
              allowClear
              placeholder={t('users.role')}
              style={{ width: 140 }}
              options={roles.data?.map((r) => ({ value: r.id, label: r.name }))}
              onChange={(roleId) => table.setFilters({ roleId })}
            />
          </Space>
        }
        actions={
          <Auth code="system:user:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing('new')}>
              {t('users.add')}
            </Button>
          </Auth>
        }
      />
      {editing && (
        <UserFormModal
          user={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </Card>
  )
}
