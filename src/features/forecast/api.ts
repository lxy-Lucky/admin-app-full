import type { RateRunInfo, RateUpdateItem } from '@/shared/rate-table'
import type { TableQuery } from '@/shared/hooks'
import { http } from '@/shared/request'
import type { PageResult } from '@/shared/types/api'
import { downloadFile } from '@/shared/utils/download'
import type { ElemChangeRow, ElemClassRow, JhsChangeRow, JhsClassRow } from './types'

type YearQuery = TableQuery<{ year: number }>

export const classApi = {
  elem: {
    list: (params: YearQuery) =>
      http.get<PageResult<ElemClassRow>>('/forecast/elem-student-class', { params }),
  },
  jhs: {
    list: (params: YearQuery) =>
      http.get<PageResult<JhsClassRow>>('/forecast/jhs-student-class', { params }),
  },
  /** One file feeds both the elementary and the junior high list. */
  import: (year: number, files: File[]) => {
    const form = new FormData()
    form.append('year', String(year))
    for (const file of files) form.append('file', file)
    return http.post<{ count: number }, FormData>('/forecast/student-class/import', form)
  },
}

/** list / info / save for a rate table under `base`. */
function rateApi<T>(base: string) {
  return {
    list: (params: YearQuery) => http.get<PageResult<T>>(base, { params }),
    info: (year: number) => http.get<RateRunInfo | null>(`${base}/info`, { params: { year } }),
    update: (year: number, list: RateUpdateItem[]) =>
      http.post<null>(`${base}/update`, { year, list }),
  }
}

export const elemRateApi = {
  ...rateApi<ElemChangeRow>('/forecast/elem-change-rates'),
  /** Registered infant / enrolment / elementary rates as Excel. */
  printRates: (year: number, name: string) =>
    downloadFile('/forecast/elem-change-rates/print', { year }, `${name}_${year}.xlsx`),
  /** Pupil forecast for the next 6 years as Excel. */
  printForecast: (year: number, name: string) =>
    downloadFile('/forecast/elem-change-rates/print-forecast', { year }, `${name}_${year}.xlsx`),
}

export const jhsRateApi = rateApi<JhsChangeRow>('/forecast/jhs-change-rates')
