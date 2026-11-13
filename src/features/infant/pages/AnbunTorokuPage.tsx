import { Radio } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { renderRate } from '@/shared/rate-table'
import { anbunApi } from '../api'
import { col, gradeColumns } from '../columns'
import SummaryPage from '../components/SummaryPage'
import { INFANT_SCOPES } from '../keys'
import type { AnbunFilter, AnbunListFlag, AnbunRow } from '../types'

type School = 'shiteikou' | 'ukeirekou' | 'ukeirekou2'

export default function AnbunTorokuPage() {
  const { t } = useTranslation('infant')
  const year = new Date().getFullYear()

  /** The second receiving school only exists for areas with two schools. */
  const noSecond = (row: AnbunRow) => row.ukeirekou2Code == null
  const dash = (kind: School, row: AnbunRow) => kind === 'ukeirekou2' && noSecond(row)

  const schoolColumns = (kind: School, nameTitle: string): ColumnsType<AnbunRow> => [
    col(nameTitle, `${kind}Nm`, 160, {
      render: (v: string | null, row) => (dash(kind, row) ? '-' : v),
    }),
    col(t('anbun.schoolCode'), `${kind}Code`, 80, {
      render: (v: string | null, row) => (dash(kind, row) ? '-' : v),
    }),
    ...gradeColumns<AnbunRow>(
      kind,
      (grade) => t('anbun.grade', { grade }),
      t('anbun.total'),
      (v, row) => (dash(kind, row) ? '-' : v),
    ),
  ]

  /** Rates of one receiving school: this year, 3-year average and the last three adopted years. */
  const rateColumns = (prefix: 'anbun' | 'anbun2', fiscalYear: number): ColumnsType<AnbunRow> =>
    (
      [
        [t('anbun.rateThisYear'), `${prefix}RateThisYear`],
        [t('anbun.avg3'), `${prefix}RateAvg3Year`],
        [t('anbun.fiscalYear', { year: fiscalYear - 3 }), `${prefix}Rate3YearAgo`],
        [t('anbun.fiscalYear', { year: fiscalYear - 2 }), `${prefix}Rate2YearAgo`],
        [t('anbun.fiscalYear', { year: fiscalYear - 1 }), `${prefix}Rate1YearAgo`],
      ] as const
    ).map(([title, field]) =>
      col<AnbunRow>(title, field, 110, {
        align: 'right',
        render: (v: number | null, row) =>
          prefix === 'anbun2' && noSecond(row) ? '-' : renderRate(v),
      }),
    )

  const columns: ColumnsType<AnbunRow> = [
    { title: t('anbun.shiteikou'), children: schoolColumns('shiteikou', t('anbun.shiteikouNm')) },
    { title: t('anbun.ukeirekou1'), children: schoolColumns('ukeirekou', t('anbun.ukeirekouNm')) },
    { title: t('anbun.ukeirekou2'), children: schoolColumns('ukeirekou2', t('anbun.ukeirekouNm')) },
    { title: t('anbun.rate1'), children: rateColumns('anbun', year) },
    { title: t('anbun.rate2'), children: rateColumns('anbun2', year) },
  ]

  return (
    <SummaryPage<AnbunRow, AnbunFilter>
      scope={INFANT_SCOPES.anbun}
      list={anbunApi.list}
      info={anbunApi.info}
      columns={columns}
      infoMode="registered"
      extraFilters={{ listFlag: 'auto' }}
      // Only the automatic result can be registered.
      action={{
        kind: 'confirm',
        label: t('anbun.register'),
        run: anbunApi.register,
        disabled: ({ filters, total }) => filters.listFlag !== 'auto' || total === 0,
      }}
      renderOptions={({ filters, setFilters }) => (
        <Radio.Group
          value={filters.listFlag}
          onChange={(e) => setFilters({ listFlag: e.target.value as AnbunListFlag })}
          options={[
            { value: 'auto', label: t('anbun.autoResult') },
            { value: 'registered', label: t('anbun.registeredRate') },
          ]}
        />
      )}
      emptyWarning={t('anbun.noData')}
    />
  )
}
