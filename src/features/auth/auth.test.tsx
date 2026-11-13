import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { InternalAxiosRequestConfig } from 'axios'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import AppProviders from '@/app/AppProviders'
import { appRoutes } from '@/app/router/routes'
import '@/app/setup-request'
import { axiosInstance, http } from '@/shared/request'
import { Auth, useAuthStore } from '@/features/auth'

type Handler = (config: InternalAxiosRequestConfig) => unknown

function mockApi(handler: Handler) {
  axiosInstance.defaults.adapter = async (config) => ({
    data: await handler(config),
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })
}

const ok = (data: unknown) => ({ code: 0, data, msg: '' })

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

async function submitLogin(username: string, password: string) {
  await userEvent.type(await screen.findByLabelText('用户名'), username)
  await userEvent.type(screen.getByLabelText('密码'), password)
  await userEvent.click(screen.getByRole('button', { name: /登\s*录/ }))
}

beforeEach(() => {
  useAuthStore.getState().clear()
})

describe('login', () => {
  it('validates required fields with Zod messages', async () => {
    renderAt('/login')
    // The mock accounts are prefilled; empty them to hit validation.
    await userEvent.clear(await screen.findByPlaceholderText('请输入用户名'))
    await userEvent.clear(screen.getByPlaceholderText('请输入密码'))
    await userEvent.click(screen.getByRole('button', { name: /登\s*录/ }))
    expect(await screen.findAllByText('此项必填')).toHaveLength(2)
  })

  it('signs in, stores the session and lands on the remembered page', async () => {
    mockApi((config) =>
      config.url === '/auth/login'
        ? ok({ token: 'tok', user: { name: 'Alice' }, permissions: ['*'] })
        : ok(null),
    )
    const router = renderAt('/system/roles')
    await submitLogin('alice', 'secret')
    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/system/roles')
    expect(useAuthStore.getState()).toMatchObject({ token: 'tok', permissions: ['*'] })
  })

  it('keeps the form and toasts the server message on failure', async () => {
    mockApi(() => ({ code: 1001, data: null, msg: '用户名或密码错误' }))
    const router = renderAt('/login')
    await submitLogin('alice', 'wrong')
    expect(await screen.findByText('用户名或密码错误')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(useAuthStore.getState().token).toBeNull()
  })
})

describe('session', () => {
  it('injects the stored token into requests', async () => {
    useAuthStore.getState().setSession({ token: 'abc', permissions: [] })
    let auth: unknown
    mockApi((config) => {
      auth = config.headers.Authorization
      return ok(null)
    })
    await http.get('/ping')
    expect(auth).toBe('Bearer abc')
  })

  it('drops the session on 401 and sends the user to /login with the current page', async () => {
    useAuthStore.getState().setSession({ token: 'old', user: { name: 'Bob' }, permissions: ['*'] })
    mockApi(() => ({ code: 401, data: null, msg: '' }))
    const router = renderAt('/dashboard')
    await screen.findByText('Bob')

    await act(async () => {
      await Promise.allSettled([http.get('/a'), http.get('/b')])
    })

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toEqual({ from: '/dashboard' })
    expect(useAuthStore.getState().token).toBeNull()
  })
})

describe('<Auth>', () => {
  const setPermissions = (permissions: string[]) =>
    useAuthStore.getState().setSession({ token: 't', permissions })

  it('renders children only with the required code', () => {
    setPermissions(['a'])
    const { rerender } = render(<Auth code="a">yes</Auth>)
    expect(screen.getByText('yes')).toBeInTheDocument()
    rerender(
      <Auth code="b" fallback="no">
        yes
      </Auth>,
    )
    expect(screen.queryByText('yes')).not.toBeInTheDocument()
    expect(screen.getByText('no')).toBeInTheDocument()
  })

  it('supports anyOf / allOf and the wildcard', () => {
    setPermissions(['a'])
    const { rerender } = render(<Auth anyOf={['a', 'b']}>any</Auth>)
    expect(screen.getByText('any')).toBeInTheDocument()
    rerender(<Auth allOf={['a', 'b']}>all</Auth>)
    expect(screen.queryByText('all')).not.toBeInTheDocument()
    act(() => setPermissions(['*']))
    expect(screen.getByText('all')).toBeInTheDocument()
  })
})
