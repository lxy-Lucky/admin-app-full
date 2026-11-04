import dayjs from 'dayjs'
import { http } from 'msw/http'
import type { User, UserInput, UserStatus } from '@/features/system/types'
import { db, roles } from '../db'
import { api, authorize, paginate, respond, respondError } from '../utils'

export const systemHandlers = [
  http.get(api('/system/users'), ({ request }) => {
    const auth = authorize(request, 'system:user:view')
    if (!auth.ok) return auth.response

    const q = new URL(request.url).searchParams
    const page = Number(q.get('page') ?? 1)
    const pageSize = Number(q.get('pageSize') ?? 10)
    const keyword = q.get('keyword')?.trim().toLowerCase()
    const status = q.get('status') as UserStatus | null
    const roleId = q.get('roleId')
    const sortField = q.get('sortField') as keyof User | null
    const sortDesc = q.get('sortOrder') === 'desc'

    const filtered = db.users.filter(
      (u) =>
        (!keyword ||
          u.username.toLowerCase().includes(keyword) ||
          u.name.includes(keyword) ||
          u.email.toLowerCase().includes(keyword)) &&
        (!status || u.status === status) &&
        (!roleId || u.roleId === Number(roleId)),
    )
    if (sortField && db.users[0] && sortField in db.users[0]) {
      filtered.sort((a, b) => {
        const [x, y] = [a[sortField], b[sortField]]
        const cmp = typeof x === 'number' ? x - (y as number) : String(x).localeCompare(String(y))
        return sortDesc ? -cmp : cmp
      })
    }
    return respond(paginate(filtered, page, pageSize))
  }),

  http.get(api('/system/users/:id'), ({ request, params }) => {
    const auth = authorize(request, 'system:user:view')
    if (!auth.ok) return auth.response
    const user = db.users.find((u) => u.id === Number(params.id))
    return user ? respond(user) : respondError(1404, '用户不存在')
  }),

  http.post(api('/system/users'), async ({ request }) => {
    const auth = authorize(request, 'system:user:add')
    if (!auth.ok) return auth.response
    const input = (await request.json()) as UserInput
    if (db.users.some((u) => u.username === input.username)) {
      return respondError(1002, '用户名已存在')
    }
    const user: User = {
      ...input,
      id: db.nextUserId++,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    db.users.unshift(user)
    return respond(user)
  }),

  http.put(api('/system/users/:id'), async ({ request, params }) => {
    const auth = authorize(request, 'system:user:edit')
    if (!auth.ok) return auth.response
    const index = db.users.findIndex((u) => u.id === Number(params.id))
    if (index < 0) return respondError(1404, '用户不存在')
    const input = (await request.json()) as Partial<UserInput>
    const updated = { ...db.users[index]!, ...input }
    db.users[index] = updated
    return respond(updated)
  }),

  http.delete(api('/system/users/:id'), ({ request, params }) => {
    const auth = authorize(request, 'system:user:delete')
    if (!auth.ok) return auth.response
    const before = db.users.length
    db.users = db.users.filter((u) => u.id !== Number(params.id))
    return db.users.length < before ? respond(null) : respondError(1404, '用户不存在')
  }),

  http.get(api('/system/roles'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    return respond(roles)
  }),
]
