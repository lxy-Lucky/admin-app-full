import { useTranslation } from 'react-i18next'
import { useInfantRateTables } from '@/features/infant'
import { RateTablesPage } from '@/shared/rate-table'
import { elemRateApi } from '../api'
import { useElemChangeTable } from '../rateTables'

/** Adopted-rate editing for the infant change / enrolment rates and the elementary change rates. */
export default function ElemChangeRatesPage() {
  const { t } = useTranslation('forecast')
  const [infantChange, infantEnrol] = useInfantRateTables()
  const elem = useElemChangeTable()

  // The infant tables are only edited here; they are rebuilt on the infant pages.
  const tables = [
    { ...infantChange!, label: t('elem.infantChange'), execute: undefined },
    { ...infantEnrol!, label: t('elem.infantEnrol'), execute: undefined },
    elem,
  ]

  return (
    <RateTablesPage
      tables={tables}
      prints={[
        {
          key: 'rates',
          label: t('elem.printRates'),
          run: (year) => elemRateApi.printRates(year, t('elem.fileName.rates')),
        },
        {
          key: 'forecast',
          label: t('elem.printForecast'),
          run: (year) => elemRateApi.printForecast(year, t('elem.fileName.forecast')),
        },
      ]}
      emptyWarning={t('notExecuted')}
    />
  )
}
