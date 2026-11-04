import { Card } from 'antd'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/shared/components'
import { useRoles } from '../hooks'
import type { Role } from '../types'

export default function RolesPage() {
  const { t } = useTranslation('system')
  const roles = useRoles()
  return (
    <Card>
      <DataTable<Role>
        rowKey="id"
        loading={roles.isLoading}
        dataSource={roles.data}
        pagination={false}
        columns={[
          { title: t('roles.code'), dataIndex: 'code' },
          { title: t('roles.name'), dataIndex: 'name' },
        ]}
      />
    </Card>
  )
}
