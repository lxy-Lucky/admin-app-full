import { useTranslation } from 'react-i18next'
import { RateTablesPage } from '@/shared/rate-table'
import { rateApis } from '../api'
import { useInfantRateTables } from '../rateTables'

export default function SummaryRatesPage() {
  const { t } = useTranslation('infant')
  const tables = useInfantRateTables()

  return (
    <RateTablesPage
      tables={tables}
      prints={[
        {
          key: 'change',
          label: t('rates.printChange'),
          run: (year) => rateApis.change.print(year, t('rates.fileName.change')),
        },
        {
          key: 'enrol',
          label: t('rates.printEnrol'),
          run: (year) => rateApis.enrol.print(year, t('rates.fileName.enrol')),
        },
      ]}
      emptyWarning={t('rates.notExecuted')}
    />
  )
}
