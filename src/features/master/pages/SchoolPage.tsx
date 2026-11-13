import { useMutation } from '@tanstack/react-query'
import { Button, Card, Checkbox, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, ImportModal, SearchForm, type SearchField } from '@/shared/components'
import { useTable } from '@/shared/hooks'
import { getYearOptions } from '@/shared/utils/year'
import { schoolApi } from '../api'
import { useImportDone, useWards } from '../hooks'
import { schoolKeys } from '../keys'
import type { School, SchoolFilter, SchoolKbn } from '../types'

interface SearchValues {
  year: number
  schoolKbn: SchoolKbn | ''
  wardCodes: string[]
  schoolNmKana: string
  closedOnly: boolean
}

const yearOptions = getYearOptions()

export default function SchoolPage() {
  const { t } = useTranslation('master')
  const wards = useWards()
  const [importing, setImporting] = useState(false)
  const currentYear = new Date().getFullYear()

  const table = useTable<School, SchoolFilter>({
    queryKey: schoolKeys.lists(),
    fetcher: schoolApi.list,
    defaultFilters: { year: currentYear },
    defaultPageSize: 50,
  })
  const year = table.filters.year

  const onDone = useImportDone([schoolKeys.lists()])
  const doImport = useMutation({
    mutationFn: (files: File[]) => schoolApi.import(year, files),
    onSuccess: async (result) => {
      setImporting(false)
      await onDone(result)
    },
  })

  const kbnLabel: Record<SchoolKbn, string> = {
    '1': t('school.elementary'),
    '5': t('school.juniorHigh'),
  }

  const fields: SearchField[] = useMemo(
    () => [
      { name: 'year', label: t('year'), kind: 'select', options: yearOptions, width: 140 },
      {
        name: 'schoolKbn',
        label: t('school.kbn'),
        kind: 'radio',
        options: [
          { value: '', label: t('all') },
          { value: '1', label: t('school.elementary') },
          { value: '5', label: t('school.juniorHigh') },
        ],
      },
      {
        name: 'wardCodes',
        label: t('school.ward'),
        kind: 'checkboxGroup',
        options: wards.data?.map((w) => ({ value: w.wardCode, label: w.wardNm })) ?? [],
        width: '100%',
      },
      { name: 'schoolNmKana', label: t('school.kanaSearch'), kind: 'text', width: 220 },
      { name: 'closedOnly', label: t('school.closedOnly'), kind: 'checkbox' },
    ],
    [t, wards.data],
  )

  const defaultValues: SearchValues = {
    year: currentYear,
    schoolKbn: '',
    wardCodes: [],
    schoolNmKana: '',
    closedOnly: false,
  }

  const columns: ColumnsType<School> = [
    {
      title: t('school.kbn'),
      dataIndex: 'schoolKbn',
      key: 'schoolKbn',
      sorter: true,
      render: (value: SchoolKbn) => kbnLabel[value],
    },
    { title: t('school.wardCode'), dataIndex: 'wardCode', key: 'wardCode', sorter: true },
    { title: t('school.wardNm'), dataIndex: 'wardNm', key: 'wardNm', sorter: true },
    {
      title: t('school.schoolNmKana'),
      dataIndex: 'schoolNmKana',
      key: 'schoolNmKana',
      sorter: true,
    },
    { title: t('school.schoolNm'), dataIndex: 'schoolNm', key: 'schoolNm', sorter: true },
    { title: t('school.codePre'), dataIndex: 'codePre', key: 'codePre', sorter: true },
    { title: t('school.codeCity'), dataIndex: 'codeCity', key: 'codeCity', sorter: true },
    { title: t('school.codeGov'), dataIndex: 'codeGov', key: 'codeGov', sorter: true },
    { title: t('school.tel'), dataIndex: 'tel', key: 'tel', sorter: true },
    { title: t('school.address'), dataIndex: 'address', key: 'address', sorter: true },
    { title: t('school.note'), dataIndex: 'note', key: 'note', sorter: true },
    {
      title: t('school.closed'),
      dataIndex: 'closed',
      key: 'closed',
      sorter: true,
      render: (closed: boolean) => <Checkbox checked={closed} disabled />,
    },
  ]

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <SearchForm<SearchValues>
        fields={fields}
        defaultValues={defaultValues}
        onSearch={(v) =>
          table.setFilters({
            year: v.year ?? currentYear,
            schoolKbn: v.schoolKbn || undefined,
            wardCodes: v.wardCodes.length ? v.wardCodes : undefined,
            schoolNmKana: v.schoolNmKana.trim() || undefined,
            closedOnly: v.closedOnly || undefined,
          })
        }
      />
      <Card>
        <DataTable<School>
          fillHeight
          rowKey="id"
          columns={columns}
          {...table.tableProps}
          filters={<Tag color="blue">{t('yearLabel', { year })}</Tag>}
          actions={
            <Button type="primary" onClick={() => setImporting(true)}>
              {t('importData')}
            </Button>
          }
        />
      </Card>
      {importing && (
        <ImportModal
          title={t('importData')}
          accept=".xlsx"
          confirmLoading={doImport.isPending}
          onCancel={() => setImporting(false)}
          onSubmit={(files) => doImport.mutate(files)}
        >
          <p>
            {t('school.importHint')}
            <br />
            {t('import.overwrite')}
          </p>
        </ImportModal>
      )}
    </Space>
  )
}
