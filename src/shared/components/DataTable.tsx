import { Table, type TableProps } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface DataTableProps<T> extends TableProps<T> {
  /** Left side above the table: search / filter controls. */
  filters?: ReactNode
  /** Right side above the table: primary actions (add, export, ...). */
  actions?: ReactNode
}

/** antd Table with project defaults (size, horizontal scroll, paging controls, "total" text). */
export default function DataTable<T extends object>({
  filters,
  actions,
  pagination,
  ...rest
}: DataTableProps<T>) {
  const { t } = useTranslation()
  return (
    <>
      {(filters || actions) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>{filters}</div>
          <div>{actions}</div>
        </div>
      )}
      <Table<T>
        size="middle"
        scroll={{ x: 'max-content' }}
        pagination={
          pagination === false
            ? false
            : {
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                showTotal: (total) => t('table.total', { total }),
                ...pagination,
              }
        }
        {...rest}
      />
    </>
  )
}
