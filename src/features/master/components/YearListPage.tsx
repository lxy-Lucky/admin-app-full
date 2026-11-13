import { useMutation } from '@tanstack/react-query'
import { Button, Card, Select, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, ImportModal } from '@/shared/components'
import { useTable, type TableQuery } from '@/shared/hooks'
import type { PageResult } from '@/shared/types/api'
import { getYearOptions } from '@/shared/utils/year'
import { useImportDone } from '../hooks'
import type { ImportResult, YearFilter } from '../types'

interface Props<T extends object> {
  /** Base query key of the list (invalidated after an import). */
  listKey: readonly unknown[]
  fetcher: (query: TableQuery<YearFilter>) => Promise<PageResult<T>>
  importFn: (year: number, files: File[]) => Promise<ImportResult>
  columns: ColumnsType<T>
  /** File types accepted by the import dialog. */
  accept: string
  /** Dialog text naming the file to pick for the chosen year. */
  hint: (year: number) => ReactNode
  rowKey?: string
}

const yearOptions = getYearOptions()

/** List filtered by fiscal year with a "data import" action (juki DB, school area info). */
export default function YearListPage<T extends object>({
  listKey,
  fetcher,
  importFn,
  columns,
  accept,
  hint,
  rowKey = 'id',
}: Props<T>) {
  const { t } = useTranslation('master')
  const [year, setYear] = useState(new Date().getFullYear())
  const [importing, setImporting] = useState(false)
  const table = useTable<T, YearFilter>({
    queryKey: listKey,
    fetcher,
    defaultFilters: { year },
    defaultPageSize: 50,
  })
  const onDone = useImportDone([listKey])

  const doImport = useMutation({
    mutationFn: (files: File[]) => importFn(year, files),
    onSuccess: async (result) => {
      setImporting(false)
      await onDone(result)
    },
  })

  return (
    <Card>
      <DataTable<T>
        fillHeight
        rowKey={rowKey}
        columns={columns}
        {...table.tableProps}
        filters={
          <Space>
            <span>{t('year')}</span>
            <Select
              aria-label={t('year')}
              style={{ width: 120 }}
              value={year}
              options={yearOptions}
              onChange={(value) => {
                setYear(value)
                table.setFilters({ year: value })
              }}
            />
          </Space>
        }
        actions={
          <Button type="primary" onClick={() => setImporting(true)}>
            {t('importData')}
          </Button>
        }
      />
      {importing && (
        <ImportModal
          title={t('importData')}
          accept={accept}
          confirmLoading={doImport.isPending}
          onCancel={() => setImporting(false)}
          onSubmit={(files) => doImport.mutate(files)}
        >
          <p>
            {hint(year)}
            <br />
            {t('import.overwrite')}
          </p>
        </ImportModal>
      )}
    </Card>
  )
}
