import { http } from 'msw/http'
import type {
  GakusekiKbn,
  GakusekiKbnStatus,
  GakusekiRecord,
  School,
} from '@/features/master/types'
import { generate, masterDb, MOCK_IMPORT_ROWS, wards } from '../master-db'
import { api, authorize, paginate, respond, respondError, sortRows } from '../utils'

/** page / pageSize / sort / year shared by every master list endpoint. */
function listParams(request: Request) {
  const q = new URL(request.url).searchParams
  return {
    q,
    year: Number(q.get('year') ?? new Date().getFullYear()),
    page: Number(q.get('page') ?? 1),
    pageSize: Number(q.get('pageSize') ?? 50),
    sortField: q.get('sortField'),
    desc: q.get('sortOrder') === 'desc',
  }
}

/** Reads the multipart import body; a missing file is a business error like the real backend. */
async function readImport(request: Request) {
  const form = await request.formData()
  const files = form.getAll('file').filter((f): f is File => typeof f !== 'string')
  return { form, files, year: Number(form.get('year')) }
}

export const masterHandlers = [
  http.get(api('/master/juki-db'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year, page, pageSize, sortField, desc } = listParams(request)
    const rows = sortRows(masterDb.juki.get(year) ?? [], sortField, desc)
    return respond(paginate(rows, page, pageSize))
  }),

  http.post(api('/master/juki-db/import'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { files, year } = await readImport(request)
    if (files.length === 0) return respondError(2001, '未选择文件')
    masterDb.juki.set(year, generate.juki(MOCK_IMPORT_ROWS.juki))
    return respond({ count: MOCK_IMPORT_ROWS.juki })
  }),

  http.get(api('/master/school-area-info'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year, page, pageSize, sortField, desc } = listParams(request)
    const rows = sortRows(masterDb.area.get(year) ?? [], sortField, desc)
    return respond(paginate(rows, page, pageSize))
  }),

  http.post(api('/master/school-area-info/import'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { files, year } = await readImport(request)
    if (files.length === 0) return respondError(2001, '未选择文件')
    masterDb.area.set(year, generate.area(MOCK_IMPORT_ROWS.area))
    return respond({ count: MOCK_IMPORT_ROWS.area })
  }),

  http.get(api('/master/wards'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    return respond(wards)
  }),

  http.get(api('/master/schools'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { q, year, page, pageSize, sortField, desc } = listParams(request)
    const kbn = q.get('schoolKbn')
    const wardCodes = q.get('wardCodes')?.split(',').filter(Boolean)
    const kana = q.get('schoolNmKana')?.trim()
    const closedOnly = q.get('closedOnly') === 'true'

    const rows = (masterDb.schools.get(year) ?? []).filter(
      (s: School) =>
        (!kbn || s.schoolKbn === kbn) &&
        (!wardCodes?.length || wardCodes.includes(s.wardCode)) &&
        (!kana || s.schoolNmKana.includes(kana)) &&
        (!closedOnly || s.closed),
    )
    return respond(paginate(sortRows(rows, sortField, desc), page, pageSize))
  }),

  http.post(api('/master/schools/import'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { files, year } = await readImport(request)
    if (files.length === 0) return respondError(2001, '未选择文件')
    masterDb.schools.set(year, generate.schools(MOCK_IMPORT_ROWS.schools))
    return respond({ count: MOCK_IMPORT_ROWS.schools })
  }),

  http.get(api('/master/gakuseki-db/status'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year } = listParams(request)
    const statusOf = (kbn: GakusekiKbn): GakusekiKbnStatus => {
      const byWard = masterDb.gakuseki.get(`${year}:${kbn}`) ?? {}
      const list = wards.map((w) => ({ ...w, imported: w.wardCode in byWard }))
      return { complete: list.every((w) => w.imported), wards: list }
    }
    return respond({ elem: statusOf('1'), jhs: statusOf('2') })
  }),

  http.get(api('/master/gakuseki-db'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { q, year, page, pageSize, sortField, desc } = listParams(request)
    const kbn = (q.get('kbn') ?? '1') as GakusekiKbn
    const byWard = masterDb.gakuseki.get(`${year}:${kbn}`) ?? {}
    const rows: GakusekiRecord[] = Object.keys(byWard)
      .sort()
      .flatMap((code) => byWard[code]!)
    return respond(paginate(sortRows(rows, sortField, desc), page, pageSize))
  }),

  http.post(api('/master/gakuseki-db/import'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { form, files, year } = await readImport(request)
    if (files.length === 0) return respondError(2001, '未选择文件')
    const kbn = form.get('kbn') as GakusekiKbn
    const key = `${year}:${kbn}`
    const byWard = masterDb.gakuseki.get(key) ?? {}
    // The mock maps each file to the next ward in order (the real backend reads the ward from the file).
    let count = 0
    files.forEach((_, i) => {
      const index = i % wards.length
      const rows = generate.gakuseki(wards[index]!, index, kbn)
      byWard[wards[index]!.wardCode] = rows
      count += rows.length
    })
    masterDb.gakuseki.set(key, byWard)
    return respond({ count })
  }),
]
