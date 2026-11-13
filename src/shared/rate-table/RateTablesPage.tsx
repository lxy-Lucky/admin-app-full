import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Collapse, Flex, Radio, Select, Space, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/shared/components'
import { useTable, type TableQuery } from '@/shared/hooks'
import type { PageResult } from '@/shared/types/api'
import { getYearOptions } from '@/shared/utils/year'
import { rateColumns, schoolColumns } from './columns'
import type { RateRow, RateUpdateItem } from './types'
import { useRateEdits } from './useRateEdits'

/**
 * 费率表格执行记录。
 *
 * 记录表格最近一次生成和人工修改的时间及操作人。
 */
export interface RateRunInfo {
  executedAt: string
  executedBy: string
  updatedAt?: string | null
  updatedBy?: string | null
}

/**
 * 单个费率表格的业务配置。
 *
 * 通过配置注入不同表格的数据查询、生成、保存及导出逻辑，
 * 使多个费率表格页面可以复用同一套 UI 和交互。
 */
export interface RateTableConfig {
  /** 表格唯一标识，用于切换表格及组件重置。 */
  key: string
  /** 单选项展示名称，同时用于相关提示信息。 */
  label: string
  /** TanStack Query 缓存 Key 的业务作用域。 */
  scope: string
  /** 获取指定年份的分页费率数据。 */
  list: (query: TableQuery<{ year: number }>) => Promise<PageResult<RateRow>>
  /** 获取指定年份的表格生成及人工修改记录。 */
  info?: (year: number) => Promise<RateRunInfo | null>
  /** 重新生成指定年份的费率表格；不支持生成的表格无需提供。 */
  execute?: (year: number) => Promise<unknown>
  /** 保存当前页面所有行的采纳费率、其他费率及备注。 */
  update: (year: number, list: RateUpdateItem[]) => Promise<unknown>
  /** 学校基础信息列与费率列之间的附加人数列。 */
  countColumns: ColumnsType<RateRow>
}

/**
 * 费率表格导出配置。
 */
export interface RatePrint {
  /** 导出操作唯一标识。 */
  key: string
  /** 导出按钮展示名称。 */
  label: string
  /** 执行指定年份的导出，返回导出结果。 */
  run: (year: number) => Promise<'saved' | 'empty' | 'failed'>
}

interface Props {
  /** 当前页面支持的费率表格配置。 */
  tables: RateTableConfig[]
  /** 当前页面支持的导出操作。 */
  prints?: RatePrint[]
  /** 表格无数据时展示的提示信息。 */
  emptyWarning: string
}

const yearOptions = getYearOptions()

interface ViewProps extends Props {
  /** 当前展示的费率表格配置。 */
  config: RateTableConfig
  /** 当前查询年份。 */
  year: number
  /** 切换费率表格。 */
  onTableChange: (key: string) => void
  /** 切换查询年份。 */
  onYearChange: (year: number) => void
}

/**
 * 单个费率表格的展示与交互组件。
 *
 * 负责年份筛选、数据查询、费率编辑、重新生成、保存和导出。
 * 切换表格时通过 key 重新挂载，避免不同表格之间的编辑状态残留。
 */
function RatesView({
  config,
  tables,
  prints,
  emptyWarning,
  year,
  onTableChange,
  onYearChange,
}: ViewProps) {
  const { t } = useTranslation()
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()

  // 根据当前表格配置查询分页数据，年份作为默认筛选条件。
  const table = useTable<RateRow, { year: number }>({
    queryKey: [config.scope, 'list'],
    fetcher: config.list,
    defaultFilters: { year },
    defaultPageSize: 50,
  })
  // 查询当前年份的表格生成及人工修改记录；没有配置 info 时跳过请求。
  const info = useQuery({
    queryKey: [config.scope, 'info', year],
    queryFn: () => config.info!(year),
    enabled: !!config.info,
  })
  // 根据当前页数据初始化并维护本地编辑状态。
  const edits = useRateEdits(table.tableProps.dataSource)

  const total = table.tableProps.pagination.total
  const loading = table.tableProps.loading
  // 刷新当前表格作用域下的列表和执行记录缓存。
  const refresh = () => queryClient.invalidateQueries({ queryKey: [config.scope] })
  // 按学校信息、人数信息、费率信息的顺序组合表格列。
  const columns: ColumnsType<RateRow> = [
    ...schoolColumns<RateRow>(t),
    ...config.countColumns,
    ...rateColumns<RateRow>(t, year, edits),
  ]
  // 重新生成成功后提示结果，并刷新当前表格数据。
  const execute = useMutation({
    mutationFn: () => config.execute!(year),
    onSuccess: async () => {
      modal.success({ title: t('rateTable.done') })
      await refresh()
    },
  })
  // 保存当前页全部行的编辑结果；成功后刷新服务端数据。
  const save = useMutation({
    mutationFn: () => config.update(year, edits.toUpdateList()),
    onSuccess: async () => {
      modal.success({ title: t('rateTable.saved') })
      await refresh()
    },
  })
  // 执行指定的导出操作；没有可导出数据时提示用户。
  const print = useMutation({
    mutationFn: (p: RatePrint) => p.run(year),
    onSuccess: (result) => {
      if (result === 'empty') void message.warning(t('rateTable.nothingToPrint'))
    },
  })

  const onExecute = () =>
    modal.confirm({
      title: t('confirm.title'),
      // 重新生成会覆盖当前表格，包括已经人工保存的修改。
      content: total > 0 ? t('rateTable.overwrite', { name: config.label }) : undefined,
      okText: t('actions.confirm'),
      cancelText: t('actions.cancel'),
      onOk: () => execute.mutateAsync().catch(() => undefined),
    })

  const onSave = () => {
    // 选择 OTHER 时必须填写其他费率，校验通过后才允许提交。
    const missing = edits.findMissingOtherRate()
    if (missing) {
      return void message.error(t('rateTable.otherRequired', { school: missing.schoolNm }))
    }
    modal.confirm({
      title: t('confirm.save'),
      okText: t('actions.confirm'),
      cancelText: t('actions.cancel'),
      onOk: () => save.mutateAsync().catch(() => undefined),
    })
  }

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <Collapse
        defaultActiveKey={['panel']}
        items={[
          {
            key: 'panel',
            label: t('rateTable.panelTitle'),
            children: (
              <Flex vertical gap={12}>
                <Space>
                  <Select
                    aria-label={t('rateTable.year')}
                    style={{ width: 120 }}
                    value={year}
                    options={yearOptions}
                    onChange={(value) => {
                      onYearChange(value)
                      table.setFilters({ year: value })
                    }}
                  />
                  <span>{t('rateTable.year')}</span>
                </Space>
                {(config.execute || info.data) && (
                  <Flex gap={16} align="center" wrap>
                    {config.execute && (
                      <Button
                        type="primary"
                        loading={execute.isPending}
                        disabled={loading}
                        onClick={onExecute}
                      >
                        {t('rateTable.execute')}
                      </Button>
                    )}
                    {info.data && (
                      <Space size={16} wrap>
                        <Typography.Text>
                          {t('rateTable.executedAt')}：{info.data.executedAt}
                        </Typography.Text>
                        <Typography.Text>
                          {t('rateTable.executedBy')}：{info.data.executedBy}
                        </Typography.Text>
                        {info.data.updatedAt && (
                          <>
                            <Typography.Text>
                              {t('rateTable.updatedAt')}：{info.data.updatedAt}
                            </Typography.Text>
                            <Typography.Text>
                              {t('rateTable.updatedBy')}：{info.data.updatedBy}
                            </Typography.Text>
                          </>
                        )}
                      </Space>
                    )}
                  </Flex>
                )}
                {tables.length > 1 && (
                  <Radio.Group
                    value={config.key}
                    onChange={(e) => onTableChange(e.target.value as string)}
                    options={tables.map((c) => ({ value: c.key, label: c.label }))}
                  />
                )}
              </Flex>
            ),
          },
        ]}
      />

      {!loading && total === 0 && <Alert type="warning" showIcon title={emptyWarning} />}

      <Card>
        <DataTable<RateRow>
          fillHeight
          rowKey="id"
          columns={columns}
          {...table.tableProps}
          filters={
            <Space wrap>
              {prints?.map((p) => (
                <Button
                  key={p.key}
                  type="primary"
                  loading={print.isPending && print.variables?.key === p.key}
                  disabled={loading || total === 0}
                  onClick={() => print.mutate(p)}
                >
                  {p.label}
                </Button>
              ))}
            </Space>
          }
          actions={
            <Button
              type="primary"
              loading={save.isPending}
              disabled={loading || total === 0}
              onClick={onSave}
            >
              {t('rateTable.save')}
            </Button>
          }
        />
      </Card>
    </Space>
  )
}

/**
 * 费率表格页面。
 *
 * 统一承载不同类型的费率表格，支持年份切换、表格切换、
 * 重新生成、执行记录查看、Excel 导出及费率编辑保存。
 */
export default function RateTablesPage(props: Props) {
  const [key, setKey] = useState(props.tables[0]!.key)
  const [year, setYear] = useState(new Date().getFullYear())
  const config = props.tables.find((c) => c.key === key) ?? props.tables[0]!

  return (
    <RatesView
      key={config.key}
      {...props}
      config={config}
      year={year}
      onTableChange={setKey}
      onYearChange={setYear}
    />
  )
}
