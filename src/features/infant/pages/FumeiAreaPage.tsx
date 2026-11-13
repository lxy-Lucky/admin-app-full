import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { fumeiApi } from '../api'
import SummaryPage from '../components/SummaryPage'
import { col } from '../columns'
import { INFANT_SCOPES } from '../keys'
import type { FumeiRow } from '../types'

export default function FumeiAreaPage() {
  const { t } = useTranslation('infant')

  const columns: ColumnsType<FumeiRow> = [
    col(t('fumei.personName'), 'personName', 160),
    col(t('fumei.age'), 'age', 70, { align: 'right' }),
    col(t('fumei.birthDate'), 'birthDate', 110),
    col(t('fumei.wardNm'), 'wardNm', 90),
    col(t('fumei.azaName'), 'azaName', 150),
    col(t('fumei.banchigou'), 'banchigou', 140),
    col(t('fumei.katagaki'), 'katagaki', 150),
    col(t('fumei.branchNum'), 'branchNum', 120),
    col(t('fumei.reason'), 'fumeiReason', 200),
  ]

  return (
    <SummaryPage<FumeiRow>
      scope={INFANT_SCOPES.fumei}
      list={fumeiApi.list}
      info={fumeiApi.info}
      columns={columns}
      action={{ kind: 'confirm', label: t('execute'), run: fumeiApi.execute }}
      print={(year) => fumeiApi.print(year, t('fumei.fileName'))}
      emptyWarning={t('notExecuted')}
    />
  )
}
