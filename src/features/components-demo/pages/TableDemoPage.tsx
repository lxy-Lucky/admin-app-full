import { PlusOutlined } from '@ant-design/icons'
import { App, Button, Input, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { ConfirmAction, DataTable } from '@/shared/components'
import { useTable, type TableQuery } from '@/shared/hooks'
import type { PageResult } from '@/shared/types/api'
import DemoSection from '../components/DemoSection'

interface Row {
  id: number
  name: string
  dept: string
  status: 'enabled' | 'disabled'
  createdAt: string
}

const depts = ['R&D', 'Design', 'Sales', 'Ops']
const rows: Row[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: `Member ${String(i + 1).padStart(2, '0')}`,
  dept: depts[i % depts.length]!,
  status: i % 4 === 0 ? 'disabled' : 'enabled',
  createdAt: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
}))

type Filters = { keyword?: string }

/** Stands in for an API call: filters, sorts and slices local data. */
async function fetchRows(q: TableQuery<Filters>): Promise<PageResult<Row>> {
  let list = rows.filter(
    (r) => !q.keyword || r.name.toLowerCase().includes(q.keyword.toLowerCase()),
  )
  if (q.sortField === 'name' || q.sortField === 'createdAt') {
    const field = q.sortField
    const dir = q.sortOrder === 'desc' ? -1 : 1
    list = [...list].sort((a, b) => a[field].localeCompare(b[field]) * dir)
  }
  const start = (q.page - 1) * q.pageSize
  return {
    list: list.slice(start, start + q.pageSize),
    total: list.length,
    page: q.page,
    pageSize: q.pageSize,
  }
}

const code = `const table = useTable<Row, { keyword?: string }>({
  queryKey: ['demo', 'rows'],
  fetcher: api.list, // (query) => Promise<PageResult<Row>>
})

<DataTable<Row>
  rowKey="id"
  columns={columns}
  fillHeight // rows scroll inside the table, fitted to the window
  {...table.tableProps}
  filters={<Input.Search onSearch={(keyword) => table.setFilters({ keyword })} />}
  actions={<Button type="primary">Add</Button>}
/>`

export default function TableDemoPage() {
  const { t } = useTranslation('components')
  const { t: tc } = useTranslation()
  const { message } = App.useApp()
  const table = useTable<Row, Filters>({
    queryKey: ['components-demo', 'rows'],
    fetcher: fetchRows,
  })

  const columns: ColumnsType<Row> = [
    { title: t('table.name'), dataIndex: 'name', key: 'name', sorter: true },
    { title: t('table.dept'), dataIndex: 'dept' },
    {
      title: t('table.status'),
      dataIndex: 'status',
      render: (status: Row['status']) => (
        <Tag color={status === 'enabled' ? 'success' : 'default'}>{t(`table.${status}`)}</Tag>
      ),
    },
    { title: t('table.createdAt'), dataIndex: 'createdAt', key: 'createdAt', sorter: true },
    {
      title: t('table.actions'),
      key: 'actions',
      fixed: 'right',
      render: () => (
        <Space size={0}>
          <Button type="link">{tc('actions.edit')}</Button>
          <ConfirmAction onConfirm={() => void message.success(t('table.deleted'))}>
            <Button type="link" danger>
              {tc('actions.delete')}
            </Button>
          </ConfirmAction>
        </Space>
      ),
    },
  ]

  return (
    <DemoSection title={t('table.title')} description={t('table.desc')} code={code}>
      <DataTable<Row>
        rowKey="id"
        columns={columns}
        fillHeight
        {...table.tableProps}
        filters={
          <Input.Search
            allowClear
            placeholder={t('table.search')}
            style={{ width: 240 }}
            onSearch={(keyword) => table.setFilters({ keyword: keyword.trim() || undefined })}
          />
        }
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => void message.info(t('table.added'))}
          >
            {t('table.add')}
          </Button>
        }
      />
    </DemoSection>
  )
}
