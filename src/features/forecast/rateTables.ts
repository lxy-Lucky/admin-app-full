import { useTranslation } from 'react-i18next'
import { countColumn, type RateRow, type RateTableConfig } from '@/shared/rate-table'
import { elemRateApi, jhsRateApi } from './api'
import { FORECAST_SCOPES } from './keys'

/** 小学校増減率表 */
export function useElemChangeTable(): RateTableConfig {
  const { t } = useTranslation('forecast')
  return {
    key: 'elem-change',
    label: t('elem.change'),
    scope: FORECAST_SCOPES.elemChange,
    list: elemRateApi.list as RateTableConfig['list'],
    info: elemRateApi.info,
    update: elemRateApi.update,
    countColumns: [
      ...[1, 2, 3, 4, 5].map((grade) =>
        countColumn<RateRow>(t('elem.lastYearGrade', { grade }), `lastYearStudents${grade}`),
      ),
      countColumn<RateRow>(t('lastYearTotal'), 'lastYearTotal'),
      ...[2, 3, 4, 5, 6].map((grade) =>
        countColumn<RateRow>(t('elem.thisYearGrade', { grade }), `thisYearStudents${grade}`),
      ),
      countColumn<RateRow>(t('thisYearTotal'), 'thisYearTotal'),
    ],
  }
}

/** 中学校増減率表 */
export function useJhsChangeTable(): RateTableConfig {
  const { t } = useTranslation('forecast')
  return {
    key: 'jhs-change',
    label: t('jhs.change'),
    scope: FORECAST_SCOPES.jhsChange,
    list: jhsRateApi.list as RateTableConfig['list'],
    info: jhsRateApi.info,
    update: jhsRateApi.update,
    countColumns: [
      ...[1, 2].map((grade) =>
        countColumn<RateRow>(t('jhs.lastYearGrade', { grade }), `lastYearJhs${grade}Students`),
      ),
      countColumn<RateRow>(t('lastYearTotal'), 'lastYearJhsTotal'),
      ...[2, 3].map((grade) =>
        countColumn<RateRow>(t('jhs.thisYearGrade', { grade }), `thisYearJhs${grade}Students`),
      ),
      countColumn<RateRow>(t('thisYearTotal'), 'thisYearJhsTotal'),
    ],
  }
}
