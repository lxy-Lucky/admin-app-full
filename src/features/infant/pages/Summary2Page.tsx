import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { renderRate } from '@/shared/rate-table'
import { summary2Api } from '../api'
import { ageColumns, col } from '../columns'
import SummaryPage from '../components/SummaryPage'
import { INFANT_SCOPES } from '../keys'
import type { Summary2Row } from '../types'

type Kind = 'shiteikou' | 'anbun' | 'anbun2' | 'result'

export default function Summary2Page() {
  const { t } = useTranslation('infant')

  const noFirst = (row: Summary2Row) => row.ukeirekouCode == null
  const noSecond = (row: Summary2Row) => row.ukeirekou2Code == null

  /** Transfer counts of a receiving school that does not exist are not applicable. */
  const countColumns = (kind: Kind): ColumnsType<Summary2Row> =>
    ageColumns<Summary2Row>(
      (age) => t('summary2.age', { age }),
      (age) => `${kind}CountAge${age}`,
      {
        total: { title: t('summary2.total'), field: `${kind}CountTotal` },
        render: (value, row) =>
          (kind === 'anbun' && noFirst(row)) || (kind === 'anbun2' && noSecond(row)) ? '-' : value,
      },
    )

  /** Receiving school name / code / rate; a missing school shows "-" (or "no transfer"). */
  const receivingColumns = (kind: 'ukeirekou' | 'ukeirekou2'): ColumnsType<Summary2Row> => {
    const none = kind === 'ukeirekou' ? noFirst : noSecond
    const rate = kind === 'ukeirekou' ? 'anbunRate' : 'anbun2Rate'
    return [
      col(t('summary2.ukeirekouNm'), `${kind}Nm`, 160, {
        render: (v: string | null, row) =>
          none(row) ? (kind === 'ukeirekou' ? t('summary2.noAccept') : '-') : v,
      }),
      col(t('summary2.schoolCode'), `${kind}Code`, 80, {
        render: (v: string | null, row) => (none(row) ? '-' : v),
      }),
      col(t('summary2.anbunRate'), rate, 100, {
        align: 'right',
        render: (v: number | null, row) => (none(row) ? '-' : renderRate(v)),
      }),
    ]
  }

  const columns: ColumnsType<Summary2Row> = [
    {
      title: t('summary2.shiteikou'),
      children: [
        col(t('summary2.shiteikouNm'), 'shiteikouNm', 160),
        col(t('summary2.schoolCode'), 'shiteikouCode', 80),
      ],
    },
    { title: t('summary2.before'), children: countColumns('shiteikou') },
    { title: t('summary2.ukeirekou1'), children: receivingColumns('ukeirekou') },
    { title: t('summary2.anbun1'), children: countColumns('anbun') },
    { title: t('summary2.ukeirekou2'), children: receivingColumns('ukeirekou2') },
    { title: t('summary2.anbun2'), children: countColumns('anbun2') },
    { title: t('summary2.after'), children: countColumns('result') },
  ]

  return (
    <SummaryPage<Summary2Row>
      scope={INFANT_SCOPES.summary2}
      list={summary2Api.list}
      info={summary2Api.info}
      columns={columns}
      action={{ kind: 'confirm', label: t('execute'), run: summary2Api.execute }}
      print={(year) => summary2Api.print(year, t('summary2.fileName'))}
      emptyWarning={t('notExecuted')}
    />
  )
}
