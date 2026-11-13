import { http } from 'msw/http'
import type { AnbunListFlag } from '@/features/infant/types'
import { generateInfant, infantDb } from '../infant-db'
import { masterDb } from '../master-db'
import { api, authorize, paginate, respond, respondError, sortRows } from '../utils'
import { rateRoutes, runOf, summaryRoutes, yearOf } from './summary-routes'

const NOT_FUMEI = '学区域不明児集计尚未执行，请先执行集计'

/** Reads `year` and optional files of a multipart import body. */
async function readImport(request: Request) {
  const form = await request.formData()
  return {
    year: Number(form.get('year')),
    files: form.getAll('file').filter((f) => typeof f !== 'string'),
  }
}

export const infantHandlers = [
  ...summaryRoutes('/infant/fumei-area', () => infantDb.fumei, 'fumei'),
  http.post(api('/infant/fumei-area/execute'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year } = (await request.json()) as { year: number }
    const missing = [
      !masterDb.juki.get(year)?.length && '住民基本台帐DB',
      !masterDb.area.get(year)?.length && '学区域信息',
    ].filter(Boolean)
    if (missing.length) return respondError(3001, `${missing.join('、')}尚未登记，无法集计`)
    const run = runOf(auth.username)
    infantDb.fumei.set(year, { run, rows: generateInfant.fumei(40) })
    return respond(run)
  }),

  ...summaryRoutes('/infant/summary1', () => infantDb.summary1, 'summary1'),
  http.post(api('/infant/summary1/execute'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year, files } = await readImport(request)
    if (files.length === 0) return respondError(2001, '未选择文件')
    if (!infantDb.fumei.has(year)) return respondError(3002, NOT_FUMEI)
    const run = runOf(auth.username)
    infantDb.summary1.set(year, { run, rows: generateInfant.summary1(25) })
    return respond(run)
  }),

  ...summaryRoutes('/infant/summary2', () => infantDb.summary2, 'summary2'),
  http.post(api('/infant/summary2/execute'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year } = (await request.json()) as { year: number }
    if (!infantDb.fumei.has(year)) return respondError(3002, NOT_FUMEI)
    const run = runOf(auth.username)
    infantDb.summary2.set(year, { run, rows: generateInfant.summary2(14) })
    return respond(run)
  }),

  ...summaryRoutes('/infant/summary3', () => infantDb.summary3, 'summary3'),
  http.post(api('/infant/summary3/execute'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year } = (await request.json()) as { year: number }
    if (!infantDb.summary2.has(year)) return respondError(3003, '2次集计尚未执行，请先执行')
    const run = runOf(auth.username)
    infantDb.summary3.set(year, { run, rows: generateInfant.summary3(14) })
    return respond(run)
  }),

  // 特調校按分登録: the "auto" list is computed on the fly when its sources exist.
  http.get(api('/infant/anbun'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const q = new URL(request.url).searchParams
    const year = yearOf(request)
    const flag = (q.get('listFlag') ?? 'auto') as AnbunListFlag
    const rows = anbunRows(year, flag)
    const sorted = sortRows(rows, q.get('sortField'), q.get('sortOrder') === 'desc')
    return respond(paginate(sorted, Number(q.get('page') ?? 1), Number(q.get('pageSize') ?? 50)))
  }),
  http.get(api('/infant/anbun/info'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    return respond(infantDb.anbunRegistered.get(yearOf(request))?.run ?? null)
  }),
  http.post(api('/infant/anbun/register'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year } = (await request.json()) as { year: number }
    const auto = anbunRows(year, 'auto')
    if (auto.length === 0) {
      return respondError(3004, '无法统计分配率，请先登记学籍DB（小学生）和学区信息')
    }
    const run = runOf(auth.username)
    infantDb.anbunRegistered.set(year, { run, rows: auto })
    return respond(run)
  }),

  ...summaryRoutes('/infant/routine-anbun', () => infantDb.routine, 'routine-anbun'),
  http.post(api('/infant/routine-anbun/register'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const { year, files } = await readImport(request)
    if (files.length === 0) return respondError(2001, '未选择文件')
    const run = runOf(auth.username)
    infantDb.routine.set(year, { run, rows: generateInfant.routine(15) })
    return respond(run)
  }),

  ...rateRoutes(
    '/infant/change-rates',
    () => infantDb.changeRates,
    (year) =>
      hasElementaryStudents(year)
        ? generateInfant.changeRates(20)
        : '学籍DB（小学生）尚未登记，无法集计',
  ),
  ...rateRoutes(
    '/infant/enrol-rates',
    () => infantDb.enrolRates,
    (year) =>
      hasElementaryStudents(year)
        ? generateInfant.enrolRates(20)
        : '学籍DB（小学生）尚未登记，无法集计',
  ),
]

function anbunRows(year: number, flag: AnbunListFlag) {
  if (flag === 'registered') return infantDb.anbunRegistered.get(year)?.rows ?? []
  const hasSources =
    Object.keys(masterDb.gakuseki.get(`${year}:1`) ?? {}).length > 0 &&
    (masterDb.area.get(year)?.length ?? 0) > 0
  return hasSources ? generateInfant.anbun(12) : []
}

const hasElementaryStudents = (year: number) =>
  Object.keys(masterDb.gakuseki.get(`${year}:1`) ?? {}).length > 0
