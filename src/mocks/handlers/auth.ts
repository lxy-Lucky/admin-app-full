import { http } from 'msw/http'
import type { LoginPayload, LoginResult } from '@/features/auth'
import { accounts } from '../db'
import { api, mockToken, respond, respondError } from '../utils'

export const authHandlers = [
  http.post(api('/auth/login'), async ({ request }) => {
    const { username, password } = (await request.json()) as LoginPayload
    const account = accounts[username]
    if (!account || account.password !== password) {
      return respondError(1001, '用户名或密码错误')
    }
    const result: LoginResult = {
      token: mockToken(username),
      user: { name: account.name },
      permissions: account.permissions,
    }
    return respond(result)
  }),

  http.post(api('/auth/logout'), () => respond(null)),
]
