import { setupServer } from 'msw/node'
import type { LoginResult } from '@/features/auth'
import type { User } from '@/features/system/types'
import type { PageResult } from '@/shared/types/api'
import { ApiError, configureRequest, http } from '@/shared/request'
import { resetDb } from './db'
import { handlers } from './handlers'

const server = setupServer(...handlers)
let token: string | null = null

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())
beforeEach(() => {
  token = null
  resetDb()
  configureRequest({
    getToken: () => token,
    notifyError: vi.fn(),
    onUnauthorized: vi.fn(),
    reportError: vi.fn(),
  })
})

async function signIn(username: string, password: string) {
  const result = await http.post<LoginResult>('/auth/login', { username, password })
  token = result.token
  return result
}

const rejection = (promise: Promise<unknown>) => promise.catch((e: unknown) => e)

describe('mock auth', () => {
  it('logs in with a demo account and returns permissions', async () => {
    const result = await signIn('admin', 'admin123')
    expect(result.permissions).toEqual(['*'])
    expect(result.user.name).toBe('Admin')
  })

  it('rejects wrong credentials with a business error', async () => {
    const err = await rejection(http.post('/auth/login', { username: 'admin', password: 'x' }))
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ kind: 'business', code: 1001 })
  })

  it('answers 401 without a token', async () => {
    const err = await rejection(http.get('/system/users'))
    expect(err).toMatchObject({ kind: 'auth', status: 401 })
  })
})

describe('mock users', () => {
  it('paginates and filters', async () => {
    await signIn('admin', 'admin123')
    const page2 = await http.get<PageResult<User>>('/system/users?page=2&pageSize=10')
    expect(page2).toMatchObject({ total: 57, page: 2, pageSize: 10 })
    expect(page2.list).toHaveLength(10)

    const byKeyword = await http.get<PageResult<User>>('/system/users?keyword=user057')
    expect(byKeyword.list.map((u) => u.username)).toEqual(['user057'])

    const disabled = await http.get<PageResult<User>>('/system/users?status=disabled&pageSize=100')
    expect(disabled.list.every((u) => u.status === 'disabled')).toBe(true)
  })

  it('sorts on the server', async () => {
    await signIn('admin', 'admin123')
    const desc = await http.get<PageResult<User>>(
      '/system/users?sortField=createdAt&sortOrder=desc',
    )
    expect(desc.list[0]?.username).toBe('user057')
    const asc = await http.get<PageResult<User>>('/system/users?sortField=username&sortOrder=asc')
    expect(asc.list[0]?.username).toBe('user001')
  })

  it('creates, updates and deletes', async () => {
    await signIn('admin', 'admin123')
    const input = {
      username: 'neo',
      name: 'Neo',
      email: 'neo@example.com',
      roleId: 2,
      status: 'enabled',
    }
    const created = await http.post<User>('/system/users', input)
    expect(created.id).toBe(58)

    const dup = await rejection(http.post('/system/users', input))
    expect(dup).toMatchObject({ kind: 'business', code: 1002 })

    const updated = await http.put<User>(`/system/users/${created.id}`, { name: 'Thomas' })
    expect(updated.name).toBe('Thomas')

    await http.delete(`/system/users/${created.id}`)
    const list = await http.get<PageResult<User>>('/system/users')
    expect(list.total).toBe(57)
  })

  it('enforces per-operation permissions (editor cannot delete, viewer cannot list users)', async () => {
    await signIn('editor', 'editor123')
    await http.get('/system/users')
    expect(await rejection(http.delete('/system/users/1'))).toMatchObject({
      kind: 'http',
      status: 403,
    })

    await signIn('viewer', 'viewer123')
    expect(await rejection(http.get('/system/users'))).toMatchObject({ status: 403 })
  })
})

describe('mock misc', () => {
  it('serves roles, dashboard overview and debug statuses', async () => {
    await signIn('admin', 'admin123')
    expect(await http.get<unknown[]>('/system/roles')).toHaveLength(3)
    const overview = await http.get<{ cards: unknown[] }>('/dashboard/overview')
    expect(overview.cards).toHaveLength(4)
    expect(await rejection(http.get('/mock/status/500'))).toMatchObject({
      kind: 'http',
      status: 500,
    })
  })
})
