import { useTranslation } from 'react-i18next'
import { countColumn, type RateRow, type RateTableConfig } from '@/shared/rate-table'
import { rateApis } from './api'
import { INFANT_SCOPES } from './keys'

/** The infant change-rate and enrolment-rate tables (also shown on the elementary forecast page). */
export function useInfantRateTables(): RateTableConfig[] {
  const { t } = useTranslation('infant')
  const { change, enrol } = rateApis

  return [
    {
      key: 'infant-change',
      label: t('rates.name.change'),
      scope: INFANT_SCOPES.changeRates,
      list: change.list as RateTableConfig['list'],
      info: change.info,
      execute: change.execute,
      update: change.update,
      countColumns: [
        ...[0, 1, 2, 3, 4].map((age) =>
          countColumn<RateRow>(t('rates.lastYearAge', { age }), `lastYearAge${age}`, 110),
        ),
        countColumn<RateRow>(t('rates.lastYearTotal'), 'lastYearTotal'),
        ...[1, 2, 3, 4, 5].map((age) =>
          countColumn<RateRow>(t('rates.thisYearAge', { age }), `thisYearAge${age}`, 110),
        ),
        countColumn<RateRow>(t('rates.thisYearTotal'), 'thisYearTotal'),
      ],
    },
    {
      key: 'infant-enrol',
      label: t('rates.name.enrol'),
      scope: INFANT_SCOPES.enrolRates,
      list: enrol.list as RateTableConfig['list'],
      info: enrol.info,
      execute: enrol.execute,
      update: enrol.update,
      countColumns: [
        countColumn<RateRow>(t('rates.lastYearAge5'), 'countAge5', 110),
        countColumn<RateRow>(t('rates.thisYearGrade1'), 'students1'),
      ],
    },
  ]
}
