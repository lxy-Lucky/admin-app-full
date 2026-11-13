import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Collapse, Flex, Select, Space, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, ImportModal } from '@/shared/components'
import { useTable, type TableQuery } from '@/shared/hooks'
import type { PageResult } from '@/shared/types/api'
import { getYearOptions } from '@/shared/utils/year'
import { infoKey, listKey } from '../keys'
import type { ExecuteInfo, YearFilter } from '../types'

type Done = 'saved' | 'empty' | 'failed'

interface ListContext<F extends YearFilter> {
  filters: F
  setFilters: (patch: Partial<F>) => void
  total: number
}

/** The button that (re)builds the summary: a confirm dialog, or a file import. */
type Action<F extends YearFilter> = {
  label: string
  disabled?: (ctx: ListContext<F>) => boolean
} & (
  | { kind: 'confirm'; run: (year: number) => Promise<unknown> }
  | {
      kind: 'import'
      accept: string
      /** Which file to pick for the chosen year. */
      hint: (year: number) => ReactNode
      /** Extra remark under the hint. */
      note?: ReactNode
      run: (year: number, files: File[]) => Promise<unknown>
    }
)

interface Props<T extends object, F extends YearFilter> {
  /** Query-key scope of the page (list and info live under it). */
  scope: string
  list: (query: TableQuery<F>) => Promise<PageResult<T>>
  /** Who ran it when. Omit for lists without that information. */
  info?: (year: number) => Promise<ExecuteInfo | null>
  columns: ColumnsType<T>
  action: Action<F>
  /** "executed" (default) or "registered" wording for the date/user line. */
  infoMode?: 'executed' | 'registered'
  /** Starting filters besides the year. */
  extraFilters?: Omit<F, 'year'>
  /** Page-specific controls inside the panel (e.g. a list switch). */
  renderOptions?: (ctx: ListContext<F>) => ReactNode
  /** Panel heading (defaults to "summary details"). */
  panelTitle?: string
  /** Controlled year: starting value, and a callback when the user picks another. */
  initialYear?: number
  onYearChange?: (year: number) => void
  /** Excel export of the list. */
  print?: (year: number) => Promise<Done>
  /** Shown above an empty list ("not executed yet"). */
  emptyWarning: string
  rowClassName?: (row: T) => string
}

const yearOptions = getYearOptions()

/**
 * Year-based summary page: a collapsible panel (year, run/import button, who ran it when,
 * page options), a warning when there is no data, and a server-paged list with an Excel export.
 */
export default function SummaryPage<T extends object, F extends YearFilter = YearFilter>({
  scope,
  list,
  info,
  columns,
  action,
  infoMode = 'executed',
  extraFilters,
  renderOptions,
  print,
  emptyWarning,
  rowClassName,
  panelTitle,
  initialYear,
  onYearChange,
}: Props<T, F>) {
  const { t } = useTranslation('infant')
  const { t: tc } = useTranslation()
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()
  const [year, setYear] = useState(initialYear ?? new Date().getFullYear())
  const [importing, setImporting] = useState(false)

  const table = useTable<T, F>({
    queryKey: listKey(scope),
    fetcher: list,
    defaultFilters: { ...extraFilters, year } as F,
    defaultPageSize: 50,
  })
  const executeInfo = useQuery({
    queryKey: infoKey(scope, year),
    queryFn: () => info!(year),
    enabled: !!info,
  })

  const total = table.tableProps.pagination.total
  const loading = table.tableProps.loading
  const ctx: ListContext<F> = { filters: table.filters, setFilters: table.setFilters, total }

  /** Success: say so and refresh the list and the info (both under the page scope). */
  const done = async () => {
    modal.success({ title: t('done') })
    await queryClient.invalidateQueries({ queryKey: [scope] })
  }

  const run = useMutation({
    mutationFn: (files?: File[]) =>
      action.kind === 'import' ? action.run(year, files ?? []) : action.run(year),
    onSuccess: async () => {
      setImporting(false)
      await done()
    },
  })

  const printMutation = useMutation({
    mutationFn: () => print!(year),
    onSuccess: (result) => {
      if (result === 'empty') void message.warning(t('nothingToPrint'))
    },
  })

  const onAction = () => {
    if (action.kind === 'import') return setImporting(true)
    modal.confirm({
      title: tc('confirm.title'),
      okText: tc('actions.confirm'),
      cancelText: tc('actions.cancel'),
      // The request layer already shows the failure; resolve either way so the dialog closes.
      onOk: () => run.mutateAsync(undefined).catch(() => undefined),
    })
  }

  const prefix = infoMode === 'registered' ? 'registered' : 'executed'

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <Collapse
        defaultActiveKey={['panel']}
        items={[
          {
            key: 'panel',
            label: panelTitle ?? t('panelTitle'),
            children: (
              <Flex vertical gap={12}>
                <Space>
                  <Select
                    aria-label={t('year')}
                    style={{ width: 120 }}
                    value={year}
                    options={yearOptions}
                    onChange={(value) => {
                      setYear(value)
                      onYearChange?.(value)
                      table.setFilters({ year: value } as Partial<F>)
                    }}
                  />
                  <span>{t('year')}</span>
                </Space>
                <Flex gap={16} align="center" wrap>
                  <Button
                    type="primary"
                    loading={run.isPending}
                    disabled={loading || action.disabled?.(ctx)}
                    onClick={onAction}
                  >
                    {action.label}
                  </Button>
                  {executeInfo.data && (
                    <Space size={16}>
                      <Typography.Text>
                        {t(`${prefix}At`)}：{executeInfo.data.executedAt}
                      </Typography.Text>
                      <Typography.Text>
                        {t(`${prefix}By`)}：{executeInfo.data.executedBy}
                      </Typography.Text>
                    </Space>
                  )}
                </Flex>
                {renderOptions?.(ctx)}
              </Flex>
            ),
          },
        ]}
      />

      {!loading && total === 0 && <Alert type="warning" showIcon title={emptyWarning} />}

      <Card>
        <DataTable<T>
          fillHeight
          rowKey="id"
          columns={columns}
          rowClassName={rowClassName}
          {...table.tableProps}
          actions={
            print && (
              <Button
                type="primary"
                loading={printMutation.isPending}
                disabled={loading || total === 0}
                onClick={() => printMutation.mutate()}
              >
                {t('print')}
              </Button>
            )
          }
        />
      </Card>

      {importing && action.kind === 'import' && (
        <ImportModal
          title={action.label}
          accept={action.accept}
          confirmLoading={run.isPending}
          onCancel={() => setImporting(false)}
          onSubmit={(files) => run.mutate(files)}
        >
          <p>
            {action.hint(year)}
            {action.note && (
              <>
                <br />
                {action.note}
              </>
            )}
          </p>
        </ImportModal>
      )}
    </Space>
  )
}
