import { http } from '@/shared/request'
import type { TableQuery } from '@/shared/hooks'
import type { PageResult } from '@/shared/types/api'
import type {
  AreaRecord,
  GakusekiFilter,
  GakusekiKbn,
  GakusekiRecord,
  GakusekiStatus,
  ImportResult,
  JukiRecord,
  School,
  SchoolFilter,
  Ward,
  YearFilter,
} from './types'

/** multipart body: scalar fields plus one or more `file` parts. */
function importForm(fields: Record<string, string | number>, files: File[]) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value))
  for (const file of files) form.append('file', file)
  return form
}

export const jukiApi = {
  list: (params: TableQuery<YearFilter>) =>
    http.get<PageResult<JukiRecord>>('/master/juki-db', { params }),
  import: (year: number, files: File[]) =>
    http.post<ImportResult, FormData>('/master/juki-db/import', importForm({ year }, files)),
}

export const areaApi = {
  list: (params: TableQuery<YearFilter>) =>
    http.get<PageResult<AreaRecord>>('/master/school-area-info', { params }),
  import: (year: number, files: File[]) =>
    http.post<ImportResult, FormData>(
      '/master/school-area-info/import',
      importForm({ year }, files),
    ),
}

export const schoolApi = {
  list: (query: TableQuery<SchoolFilter>) =>
    http.get<PageResult<School>>('/master/schools', {
      params: { ...query, wardCodes: query.wardCodes?.join(',') },
    }),
  import: (year: number, files: File[]) =>
    http.post<ImportResult, FormData>('/master/schools/import', importForm({ year }, files)),
}

export const wardApi = {
  list: () => http.get<Ward[]>('/master/wards'),
}

export const gakusekiApi = {
  list: (params: TableQuery<GakusekiFilter>) =>
    http.get<PageResult<GakusekiRecord>>('/master/gakuseki-db', { params }),
  status: (year: number) =>
    http.get<GakusekiStatus>('/master/gakuseki-db/status', { params: { year } }),
  import: (year: number, kbn: GakusekiKbn, files: File[]) =>
    http.post<ImportResult, FormData>(
      '/master/gakuseki-db/import',
      importForm({ year, kbn }, files),
    ),
}
