import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { summary3Api } from '../api'
import { ageColumns, col } from '../columns'
import SummaryPage from '../components/SummaryPage'
import styles from '../components/SummaryPage.module.scss'
import { INFANT_SCOPES } from '../keys'
import type { Summary3Row } from '../types'

export default function Summary3Page() {
  const { t } = useTranslation('infant')

  const columns: ColumnsType<Summary3Row> = [
    col(t('summary3.schoolNm'), 'schoolNm', 160),
    col(t('summary3.schoolCode'), 'schoolCode', 100),
    ...ageColumns<Summary3Row>(
      (age) => t('ageCount', { age }),
      (age) => `countAge${age}`,
    ).map((c) => ({
      ...c,
      width: 110,
      // A negative count means the routine allocation exceeds the 2nd summary: flag the cell.
      onCell: (row: Summary3Row) => ({
        className:
          Number(row[(c as { dataIndex: keyof Summary3Row }).dataIndex]) < 0
            ? styles.minusCell
            : undefined,
      }),
    })),
  ]

  return (
    <SummaryPage<Summary3Row>
      scope={INFANT_SCOPES.summary3}
      list={summary3Api.list}
      info={summary3Api.info}
      columns={columns}
      action={{ kind: 'confirm', label: t('execute'), run: summary3Api.execute }}
      print={(year) => summary3Api.print(year, t('summary3.fileName'))}
      emptyWarning={t('notExecuted')}
    />
  )
}
