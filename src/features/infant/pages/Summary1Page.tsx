import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { summary1Api } from '../api'
import { ageColumns, col } from '../columns'
import SummaryPage from '../components/SummaryPage'
import styles from '../components/SummaryPage.module.scss'
import { INFANT_SCOPES } from '../keys'
import type { Summary1Row } from '../types'

export default function Summary1Page() {
  const { t } = useTranslation('infant')

  const columns: ColumnsType<Summary1Row> = [
    col(t('summary1.wardNm'), 'wardNm', 160),
    col(t('summary1.machiAzaNm'), 'machiAzaNm', 100),
    col(t('summary1.banchiFrom'), 'banchiFrom', 120),
    col(t('summary1.banchiTo'), 'banchiTo', 120),
    ...ageColumns<Summary1Row>(
      (age) => t('ageCount', { age }),
      (age) => `countAge${age}`,
    ),
  ]

  return (
    <SummaryPage<Summary1Row>
      scope={INFANT_SCOPES.summary1}
      list={summary1Api.list}
      info={summary1Api.info}
      columns={columns}
      action={{
        kind: 'import',
        label: t('execute'),
        accept: '.xlsx',
        hint: (year) => t('summary1.importHint', { year }),
        run: summary1Api.execute,
      }}
      print={(year) => summary1Api.print(year, t('summary1.fileName'))}
      emptyWarning={t('summary1.notExecuted')}
      // Rows added through the input sheet stand out.
      rowClassName={(row) => (row.addedFromSheet ? styles.highlightRow! : '')}
    />
  )
}
