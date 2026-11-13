import type { TableQuery } from '@/shared/hooks'
import { http } from '@/shared/request'
import type { PageResult } from '@/shared/types/api'
import { downloadFile } from '@/shared/utils/download'
import type {
  AnbunFilter,
  AnbunRow,
  ExecuteInfo,
  FumeiRow,
  InfantChangeRow,
  InfantEnrolRow,
  RateKind,
  RateUpdateItem,
  RoutineAnbunRow,
  Summary1Row,
  Summary2Row,
  Summary3Row,
  YearFilter,
} from './types'

/** multipart body: the year plus the uploaded file. */
function fileForm(year: number, files: File[]) {
  const form = new FormData()
  form.append('year', String(year))
  for (const file of files) form.append('file', file)
  return form
}

/** list / info / print endpoints every summary page has under `base`. */
function summaryApi<T, F extends YearFilter = YearFilter>(base: string) {
  return {
    list: (params: TableQuery<F>) => http.get<PageResult<T>>(base, { params }),
    info: (year: number) => http.get<ExecuteInfo | null>(`${base}/info`, { params: { year } }),
    print: (year: number, fileName: string) =>
      downloadFile(`${base}/print`, { year }, `${fileName}_${year}.xlsx`),
  }
}

export const fumeiApi = {
  ...summaryApi<FumeiRow>('/infant/fumei-area'),
  execute: (year: number) => http.post<ExecuteInfo>('/infant/fumei-area/execute', { year }),
}

export const summary1Api = {
  ...summaryApi<Summary1Row>('/infant/summary1'),
  /** "Executing" the 1st summary means importing the input sheet. */
  execute: (year: number, files: File[]) =>
    http.post<ExecuteInfo, FormData>('/infant/summary1/execute', fileForm(year, files)),
}

export const summary2Api = {
  ...summaryApi<Summary2Row>('/infant/summary2'),
  execute: (year: number) => http.post<ExecuteInfo>('/infant/summary2/execute', { year }),
}

export const summary3Api = {
  ...summaryApi<Summary3Row>('/infant/summary3'),
  execute: (year: number) => http.post<ExecuteInfo>('/infant/summary3/execute', { year }),
}

export const anbunApi = {
  ...summaryApi<AnbunRow, AnbunFilter>('/infant/anbun'),
  register: (year: number) => http.post<ExecuteInfo>('/infant/anbun/register', { year }),
}

export const routineApi = {
  ...summaryApi<RoutineAnbunRow>('/infant/routine-anbun'),
  register: (year: number, files: File[]) =>
    http.post<ExecuteInfo, FormData>('/infant/routine-anbun/register', fileForm(year, files)),
}

function rateApi<T>(base: string) {
  return {
    ...summaryApi<T>(base),
    execute: (year: number) => http.post<ExecuteInfo>(`${base}/execute`, { year }),
    update: (year: number, list: RateUpdateItem[]) =>
      http.post<null>(`${base}/update`, { year, list }),
  }
}

export const rateApis = {
  change: rateApi<InfantChangeRow>('/infant/change-rates'),
  enrol: rateApi<InfantEnrolRow>('/infant/enrol-rates'),
} satisfies Record<RateKind, unknown>
