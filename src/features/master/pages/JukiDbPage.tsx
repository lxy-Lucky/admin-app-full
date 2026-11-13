import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { jukiApi } from '../api'
import YearListPage from '../components/YearListPage'
import { jukiKeys } from '../keys'
import type { JukiRecord } from '../types'

export default function JukiDbPage() {
  const { t } = useTranslation('master')

  const columns: ColumnsType<JukiRecord> = [
    { title: t('juki.residentsKbn'), dataIndex: 'residentsKbn', key: 'residentsKbn', sorter: true },
    { title: t('juki.wardCode'), dataIndex: 'wardCode', key: 'wardCode', sorter: true },
    { title: t('juki.birthDate'), dataIndex: 'birthDate', key: 'birthDate', sorter: true },
    { title: t('juki.cityName'), dataIndex: 'cityName', key: 'cityName', sorter: true },
    { title: t('juki.azaName'), dataIndex: 'azaName', key: 'azaName', sorter: true },
    { title: t('juki.banchigou'), dataIndex: 'banchigou', key: 'banchigou', sorter: true },
    { title: t('juki.katagaki'), dataIndex: 'katagaki', key: 'katagaki', sorter: true },
    {
      title: t('juki.machiazaCode'),
      dataIndex: 'machiazaCode',
      key: 'machiazaCode',
      sorter: true,
    },
    { title: t('juki.branchNum'), dataIndex: 'branchNum', key: 'branchNum', sorter: true },
  ]

  return (
    <YearListPage<JukiRecord>
      listKey={jukiKeys.lists()}
      fetcher={jukiApi.list}
      importFn={jukiApi.import}
      columns={columns}
      accept=".csv"
      hint={(year) => t('juki.importHint', { year })}
    />
  )
}
