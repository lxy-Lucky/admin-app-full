import { delay } from 'msw'
import { HttpResponse } from 'msw/http'
import { env } from '@/shared/config/env'
import type { PageResult } from '@/shared/types/api'
import { accounts } from './db'

export const api = (path: string) => `${env.VITE_API_BASE_URL}${path}`

const MOCK_DELAY = import.meta.env.MODE === 'test' ? 0 : 300

export async function respond<T>(data: T) {
  await delay(MOCK_DELAY)
  return HttpResponse.json({ code: 0, data, msg: 'ok' })
}

/** Business error: HTTP 200 with a non-zero code, like the real backend envelope. */
export async function respondError(code: number, msg: string) {
  await delay(MOCK_DELAY)
  return HttpResponse.json({ code, data: null, msg })
}

export const mockToken = (username: string) => `mock-token-${username}`

type Auth = { ok: true; username: string } | { ok: false; response: Response }

/** Checks the bearer token (401 if missing/invalid) and, optionally, a permission code (403). */
export function authorize(request: Request, permission?: string): Auth {
  const match = /^Bearer mock-token-(\w+)$/.exec(request.headers.get('Authorization') ?? '')
  const username = match?.[1]
  const account = username ? accounts[username] : undefined
  if (!username || !account) {
    return {
      ok: false,
      response: HttpResponse.json({ code: 401, data: null, msg: 'Unauthorized' }, { status: 401 }),
    }
  }
  const allowed =
    !permission || account.permissions.includes('*') || account.permissions.includes(permission)
  if (!allowed) {
    return {
      ok: false,
      response: HttpResponse.json({ code: 403, data: null, msg: 'Forbidden' }, { status: 403 }),
    }
  }
  return { ok: true, username }
}

/** Sorts a copy by `field` (numbers numerically, everything else as text; arrays joined). */
export function sortRows<T extends object>(rows: T[], field: string | null, desc: boolean): T[] {
  if (!field || !rows[0] || !(field in rows[0])) return rows
  const value = (row: T) => (row as Record<string, unknown>)[field]
  return [...rows].sort((a, b) => {
    const [x, y] = [value(a), value(b)]
    const cmp =
      typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x).localeCompare(String(y), undefined, { numeric: true })
    return desc ? -cmp : cmp
  })
}

export function paginate<T>(items: T[], page: number, pageSize: number): PageResult<T> {
  const start = (page - 1) * pageSize
  return { list: items.slice(start, start + pageSize), total: items.length, page, pageSize }
}
