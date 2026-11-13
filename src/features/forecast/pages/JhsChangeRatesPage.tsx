import { useTranslation } from 'react-i18next'
import { RateTablesPage } from '@/shared/rate-table'
import { useJhsChangeTable } from '../rateTables'

/** Adopted-rate editing for the junior high change rates (no Excel export is defined yet). */
export default function JhsChangeRatesPage() {
  const { t } = useTranslation('forecast')
  const jhs = useJhsChangeTable()
  return <RateTablesPage tables={[jhs]} emptyWarning={t('notExecuted')} />
}
