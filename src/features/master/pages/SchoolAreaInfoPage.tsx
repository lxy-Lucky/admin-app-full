import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { areaApi } from '../api'
import YearListPage from '../components/YearListPage'
import { areaKeys } from '../keys'
import type { AreaRecord } from '../types'

/** Joins the four banchi parts, dropping empty / zero parts: ['12','0','0','0'] -> '12'. */
const joinBanchi = (parts: string[]) => parts.filter((p) => p && Number(p) !== 0).join('-')

export default function SchoolAreaInfoPage() {
  const { t } = useTranslation('master')

  const columns: ColumnsType<AreaRecord> = [
    { title: t('area.wardCode'), dataIndex: 'wardCode', key: 'wardCode', sorter: true },
    { title: t('area.townCode'), dataIndex: 'townCode', key: 'townCode', sorter: true },
    { title: t('area.azaCode'), dataIndex: 'azaCode', key: 'azaCode', sorter: true },
    {
      title: t('area.banchiFrom'),
      dataIndex: 'banchiFrom',
      key: 'banchiFrom',
      sorter: true,
      render: joinBanchi,
    },
    {
      title: t('area.banchiTo'),
      dataIndex: 'banchiTo',
      key: 'banchiTo',
      sorter: true,
      render: joinBanchi,
    },
    { title: t('area.shiteikou1'), dataIndex: 'shiteikou1', key: 'shiteikou1', sorter: true },
    { title: t('area.shiteikou2'), dataIndex: 'shiteikou2', key: 'shiteikou2', sorter: true },
    { title: t('area.tokuchoKbn'), dataIndex: 'tokuchoKbn', key: 'tokuchoKbn', sorter: true },
    { title: t('area.tokuchoKou1'), dataIndex: 'tokuchoKou1', key: 'tokuchoKou1', sorter: true },
    { title: t('area.tokuchoKou2'), dataIndex: 'tokuchoKou2', key: 'tokuchoKou2', sorter: true },
  ]

  return (
    <YearListPage<AreaRecord>
      listKey={areaKeys.lists()}
      fetcher={areaApi.list}
      importFn={areaApi.import}
      columns={columns}
      accept=".xlsx"
      hint={(year) => t('area.importHint', { year })}
    />
  )
}
