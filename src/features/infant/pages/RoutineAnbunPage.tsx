import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { routineApi } from '../api'
import { ageColumns, col } from '../columns'
import SummaryPage from '../components/SummaryPage'
import { INFANT_SCOPES } from '../keys'
import type { RoutineAnbunRow } from '../types'

export default function RoutineAnbunPage() {
  const { t } = useTranslation('infant')

  const columns: ColumnsType<RoutineAnbunRow> = [
    col(t('routine.shiteikouNm'), 'shiteikouNm', 160),
    col(t('routine.schoolCode'), 'shiteikouCode', 80),
    ...ageColumns<RoutineAnbunRow>(
      (age) => t('summary2.age', { age }),
      (age) => `anbunCountAge${age}`,
    ),
    col(t('routine.total'), 'totalAnbunCount', 90, { align: 'right' }),
    col(t('routine.ukeirekouNm'), 'ukeirekouNm', 160),
    col(t('routine.schoolCode'), 'ukeirekouCode', 80),
  ]

  return (
    <SummaryPage<RoutineAnbunRow>
      scope={INFANT_SCOPES.routine}
      list={routineApi.list}
      info={routineApi.info}
      columns={columns}
      infoMode="registered"
      action={{
        kind: 'import',
        label: t('routine.register'),
        accept: '.xlsx,.xlsm',
        hint: (year) => t('routine.importHint', { year }),
        note: t('routine.importNote'),
        run: routineApi.register,
      }}
      emptyWarning={t('notRegistered')}
    />
  )
}
