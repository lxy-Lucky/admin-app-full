import { http } from 'msw/http'
import { forecastDb, genElemClass, genJhsClass } from '../forecast-db'
import { api, authorize, respond, respondError } from '../utils'
import { csvResponse, rateRoutes, runOf, summaryRoutes, yearOf } from './summary-routes'

export const forecastHandlers = [
  ...summaryRoutes(
    '/forecast/elem-student-class',
    () => forecastDb.elemClass,
    'elem-student-class',
  ),
  ...summaryRoutes('/forecast/jhs-student-class', () => forecastDb.jhsClass, 'jhs-student-class'),

  // One file carries both school types.
  http.post(api('/forecast/student-class/import'), async ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const form = await request.formData()
    const files = form.getAll('file').filter((f) => typeof f !== 'string')
    if (files.length === 0) return respondError(2001, '未选择文件')
    const year = Number(form.get('year'))
    const elem = genElemClass()
    const jhs = genJhsClass()
    forecastDb.elemClass.set(year, { run: runOf(auth.username), rows: elem })
    forecastDb.jhsClass.set(year, { run: runOf(auth.username), rows: jhs })
    return respond({ count: elem.length + jhs.length })
  }),

  // The tables are built elsewhere (no execute route); this page only edits them.
  ...rateRoutes('/forecast/elem-change-rates', () => forecastDb.elemRates),
  http.get(api('/forecast/elem-change-rates/print-forecast'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const year = yearOf(request)
    return csvResponse(forecastDb.elemRates.get(year)?.rows ?? [], `elem-forecast_${year}`)
  }),
  ...rateRoutes('/forecast/jhs-change-rates', () => forecastDb.jhsRates),
]
