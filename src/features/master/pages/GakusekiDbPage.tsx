import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Card, Collapse, Flex, Radio, Select, Space, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, ImportModal } from '@/shared/components'
import { useTable } from '@/shared/hooks'
import { getYearOptions } from '@/shared/utils/year'
import { gakusekiApi } from '../api'
import { useImportDone } from '../hooks'
import { gakusekiKeys } from '../keys'
import type { GakusekiFilter, GakusekiKbn, GakusekiKbnStatus, GakusekiRecord } from '../types'

const yearOptions = getYearOptions()
const MAX_FILES = 18

export default function GakusekiDbPage() {
  const { t } = useTranslation('master')
  const currentYear = new Date().getFullYear()
  const [importing, setImporting] = useState(false)
  const [importKbn, setImportKbn] = useState<GakusekiKbn>('1')

  const table = useTable<GakusekiRecord, GakusekiFilter>({
    queryKey: gakusekiKeys.lists(),
    fetcher: gakusekiApi.list,
    defaultFilters: { year: currentYear, kbn: '1' },
    defaultPageSize: 50,
  })
  const { year, kbn } = table.filters

  const status = useQuery({
    queryKey: gakusekiKeys.status(year),
    queryFn: () => gakusekiApi.status(year),
  })

  const kbnOptions = [
    { value: '1', label: t('gakuseki.elementary') },
    { value: '2', label: t('gakuseki.juniorHigh') },
  ]

  const onDone = useImportDone([gakusekiKeys.lists(), gakusekiKeys.status(year)])
  const doImport = useMutation({
    mutationFn: (files: File[]) => gakusekiApi.import(year, importKbn, files),
    onSuccess: async (result) => {
      setImporting(false)
      await onDone(result)
    },
  })

  const renderStatus = (title: string, info?: GakusekiKbnStatus) => (
    <Space orientation="vertical" size={2}>
      <Typography.Text strong>{title}</Typography.Text>
      {info?.wards.map((w) => (
        <Typography.Text key={w.wardCode} type={w.imported ? 'success' : 'secondary'}>
          {w.wardNm}：{w.imported ? t('gakuseki.imported') : t('gakuseki.notImported')}
        </Typography.Text>
      ))}
    </Space>
  )

  const columns: ColumnsType<GakusekiRecord> = [
    { title: t('gakuseki.wardCode'), dataIndex: 'wardCode', key: 'wardCode', sorter: true },
    { title: t('gakuseki.wardNm'), dataIndex: 'wardNm', key: 'wardNm', sorter: true },
    {
      title: t('gakuseki.shiteikouCode'),
      dataIndex: 'shiteikouCode',
      key: 'shiteikouCode',
      sorter: true,
    },
    { title: t('gakuseki.grade'), dataIndex: 'grade', key: 'grade', sorter: true },
    { title: t('gakuseki.age'), dataIndex: 'age', key: 'age', sorter: true },
    { title: t('gakuseki.personName'), dataIndex: 'personName', key: 'personName', sorter: true },
    {
      title: t('gakuseki.addressDetail'),
      dataIndex: 'addressDetail',
      key: 'addressDetail',
      sorter: true,
    },
    { title: t('gakuseki.katagaki'), dataIndex: 'katagaki', key: 'katagaki', sorter: true },
    { title: t('gakuseki.areaKbn'), dataIndex: 'areaKbn', key: 'areaKbn', sorter: true },
    { title: t('gakuseki.townCode'), dataIndex: 'townCode', key: 'townCode', sorter: true },
    { title: t('gakuseki.azaCode'), dataIndex: 'azaCode', key: 'azaCode', sorter: true },
    {
      title: t('gakuseki.banchi'),
      dataIndex: 'banchi',
      key: 'banchi',
      render: (parts: string[]) => parts.join(' / '),
    },
  ]

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <Collapse
        items={[
          {
            key: 'status',
            label: t('gakuseki.statusTitle'),
            children: (
              <Flex gap={64} wrap>
                {renderStatus(t('gakuseki.elemHeading'), status.data?.elem)}
                {renderStatus(t('gakuseki.jhsHeading'), status.data?.jhs)}
              </Flex>
            ),
          },
        ]}
      />
      <Card>
        <DataTable<GakusekiRecord>
          fillHeight
          rowKey="id"
          columns={columns}
          {...table.tableProps}
          filters={
            <Space wrap>
              <Select
                aria-label={t('year')}
                style={{ width: 120 }}
                value={year}
                options={yearOptions}
                onChange={(value) => table.setFilters({ year: value })}
              />
              <span>{t('year')}</span>
              <Radio.Group
                value={kbn}
                options={kbnOptions}
                onChange={(e) => table.setFilters({ kbn: e.target.value as GakusekiKbn })}
              />
            </Space>
          }
          actions={
            <Button
              type="primary"
              onClick={() => {
                // The import target is chosen again every time the dialog opens.
                setImportKbn('1')
                setImporting(true)
              }}
            >
              {t('importData')}
            </Button>
          }
        />
      </Card>
      {importing && (
        <ImportModal
          title={t('importData')}
          accept=".xlsx"
          maxCount={MAX_FILES}
          confirmLoading={doImport.isPending}
          onCancel={() => setImporting(false)}
          onSubmit={(files) => doImport.mutate(files)}
        >
          <p>
            {t('gakuseki.importHint', {
              year,
              kbn: importKbn === '1' ? t('gakuseki.elementary') : t('gakuseki.juniorHigh'),
            })}
            <br />
            {t('gakuseki.overwrite')}
          </p>
          <Radio.Group
            value={importKbn}
            options={kbnOptions}
            onChange={(e) => setImportKbn(e.target.value as GakusekiKbn)}
            style={{ marginBottom: 16 }}
          />
        </ImportModal>
      )}
    </Space>
  )
}
