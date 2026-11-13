import { http, HttpResponse } from 'msw/http'
import type { ExecuteInfo, RateUpdateItem } from '@/features/infant/types'
import { accounts } from '../db'
import { nowText, type Stored } from '../infant-db'
import { api, authorize, paginate, respond, respondError, sortRows } from '../utils'

/** Byte order mark so Excel opens the UTF-8 CSV correctly. */
const BOM = String.fromCharCode(0xfeff)

export const thisYear = () => new Date().getFullYear()
export const yearOf = (request: Request) =>
  Number(new URL(request.url).searchParams.get('year') ?? thisYear())

/** `executedBy` shown on the page: the account's display name. */
export const who = (username: string) => accounts[username]?.name ?? username

export const runOf = (username: string): ExecuteInfo => ({
  executedAt: nowText(),
  executedBy: who(username),
})

export type Store<T> = Map<number, Stored<T>>

/** The real backend returns an .xlsx; the mock returns the rows as CSV. */
export function csvResponse(rows: object[], fileName: string) {
  if (rows.length === 0) return new HttpResponse(null, { status: 200 })
  const header = Object.keys(rows[0]!).join(',')
  const body = rows.map((r) => Object.values(r).join(',')).join('\n')
  return new HttpResponse(`${BOM}${header}\n${body}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(`${fileName}.csv`)}`,
    },
  })
}

/** list + info + print routes of one summary under `base`. */
export function summaryRoutes<T extends object>(
  base: string,
  store: () => Store<T>,
  printName: string,
) {
  return [
    http.get(api(base), ({ request }) => {
      const auth = authorize(request)
      if (!auth.ok) return auth.response
      const q = new URL(request.url).searchParams
      const rows = store().get(yearOf(request))?.rows ?? []
      const sorted = sortRows(rows, q.get('sortField'), q.get('sortOrder') === 'desc')
      return respond(paginate(sorted, Number(q.get('page') ?? 1), Number(q.get('pageSize') ?? 50)))
    }),

    http.get(api(`${base}/info`), ({ request }) => {
      const auth = authorize(request)
      if (!auth.ok) return auth.response
      return respond(store().get(yearOf(request))?.run ?? null)
    }),

    http.get(api(`${base}/print`), ({ request }) => {
      const auth = authorize(request)
      if (!auth.ok) return auth.response
      const year = yearOf(request)
      return csvResponse(store().get(year)?.rows ?? [], `${printName}_${year}`)
    }),
  ]
}

export type RateLike = {
  id: number
  avg3Rate: number | null
  avg5Rate: number | null
  adoptKbn: string | null
  thisYearRate: number | null
  miscRate: number | null
  note: string | null
}

/**
 * list / info / print plus "save changes" for a rate table; with `build` also an execute route
 * (`build` returns the new rows, or an error message when the sources are missing).
 */
export function rateRoutes<T extends RateLike>(
  base: string,
  store: () => Store<T>,
  build?: (year: number) => T[] | string,
) {
  return [
    ...summaryRoutes(base, store, base.split('/').pop()!),

    ...(build
      ? [
          http.post(api(`${base}/execute`), async ({ request }) => {
            const auth = authorize(request)
            if (!auth.ok) return auth.response
            const { year } = (await request.json()) as { year: number }
            const rows = build(year)
            if (typeof rows === 'string') return respondError(3004, rows)
            // Re-running rebuilds the table, dropping hand-made changes.
            store().set(year, { run: runOf(auth.username), rows })
            return respond(store().get(year)!.run)
          }),
        ]
      : []),

    http.post(api(`${base}/update`), async ({ request }) => {
      const auth = authorize(request)
      if (!auth.ok) return auth.response
      const { year, list } = (await request.json()) as { year: number; list: RateUpdateItem[] }
      const entry = store().get(year)
      if (!entry) return respondError(3005, '尚未集计')
      for (const item of list) {
        const row = entry.rows.find((r) => r.id === item.id)
        if (!row) continue
        row.adoptKbn = item.adoptKbn
        row.miscRate = item.miscRate
        row.note = item.note || null
        row.thisYearRate =
          item.adoptKbn === '1'
            ? row.avg3Rate
            : item.adoptKbn === '2'
              ? row.avg5Rate
              : item.adoptKbn === '9'
                ? item.miscRate
                : null
      }
      entry.run = { ...entry.run, updatedAt: nowText(), updatedBy: who(auth.username) }
      return respond(null)
    }),
  ]
}
