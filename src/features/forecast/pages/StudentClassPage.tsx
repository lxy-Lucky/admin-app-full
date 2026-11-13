import { Radio } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SummaryPage } from '@/features/infant'
import { countColumn } from '@/shared/rate-table'
import { classApi } from '../api'
import { FORECAST_SCOPES } from '../keys'
import type { ClassKind, ElemClassRow, JhsClassRow } from '../types'

type Row = ElemClassRow | JhsClassRow

interface ViewProps {
  kind: ClassKind
  year: number
  onKindChange: (kind: ClassKind) => void
  onYearChange: (year: number) => void
}

/** The list for one school type; remounted when the type switches (the columns differ). */
function ClassView({ kind, year, onKindChange, onYearChange }: ViewProps) {
  const { t } = useTranslation('forecast')
  const elem = kind === 'elem'

  const columns: ColumnsType<Row> = [
    {
      title: t('schoolNm'),
      dataIndex: 'schoolNm',
      key: 'schoolNm',
      width: 200,
      sorter: true,
    },
    {
      title: t('schoolCode'),
      dataIndex: 'schoolCode',
      key: 'schoolCode',
      width: 110,
      sorter: true,
    },
    ...(elem ? [1, 2, 3, 4, 5, 6] : [1, 2, 3]).map((grade) =>
      countColumn<Row>(
        t(elem ? 'elemStudents' : 'jhsStudents', { grade }),
        elem ? `students${grade}` : `jhs${grade}Students`,
      ),
    ),
    countColumn<Row>(t('total'), 'totalStudents'),
    ...(elem ? [1, 2, 3, 4, 5, 6] : [1, 2, 3]).map((grade) =>
      countColumn<Row>(t('classes', { grade }), elem ? `classes${grade}` : `jhs${grade}Classes`),
    ),
    countColumn<Row>(t('total'), 'totalClasses'),
    countColumn<Row>(t('specialStudents'), 'specialStudents'),
    countColumn<Row>(t('specialClasses'), 'specialClasses'),
  ]

  return (
    <SummaryPage<Row>
      scope={elem ? FORECAST_SCOPES.elemClass : FORECAST_SCOPES.jhsClass}
      list={elem ? classApi.elem.list : classApi.jhs.list}
      columns={columns}
      panelTitle={t('panelTitle')}
      initialYear={year}
      onYearChange={onYearChange}
      action={{
        kind: 'import',
        label: t('importData'),
        accept: '.xlsm',
        hint: (y) => t('importHint', { year: y }),
        note: t('importNote'),
        run: classApi.import,
      }}
      renderOptions={() => (
        <Radio.Group
          value={kind}
          onChange={(e) => onKindChange(e.target.value as ClassKind)}
          options={[
            { value: 'elem', label: t('elementary') },
            { value: 'jhs', label: t('juniorHigh') },
          ]}
        />
      )}
      emptyWarning={t('notImported')}
    />
  )
}

export default function StudentClassPage() {
  const [kind, setKind] = useState<ClassKind>('elem')
  const [year, setYear] = useState(new Date().getFullYear())
  return (
    <ClassView key={kind} kind={kind} year={year} onKindChange={setKind} onYearChange={setYear} />
  )
}
