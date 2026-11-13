import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import AppProviders from '@/app/AppProviders'
import { useAuthStore } from '@/features/auth'
import { axiosInstance } from '@/shared/request'
import { appRoutes } from './routes'

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

const signIn = (permissions: string[]) =>
  useAuthStore.getState().setSession({ token: 't', user: { name: 'Tester' }, permissions })

beforeEach(() => {
  useAuthStore.getState().clear()
  // Any API call (e.g. logout) succeeds with an empty envelope.
  axiosInstance.defaults.adapter = async (config) => ({
    data: { code: 0, data: null, msg: '' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })
})

describe('router', () => {
  it('redirects guests to /login and remembers the target', async () => {
    const router = renderAt('/system/roles')
    await screen.findByRole('button', { name: /登\s*录/ })
    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.state).toEqual({ from: '/system/roles' })
  })

  it('redirects / to /dashboard with layout, menu and breadcrumb', async () => {
    signIn(['*'])
    const router = renderAt('/')
    expect(await screen.findByRole('menuitem', { name: /系统管理/ })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /首页/ })).not.toBeInTheDocument()
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
    await waitFor(() => expect(screen.getByRole('navigation')).toHaveTextContent('首页'))
    expect(screen.getByText('Tester')).toBeInTheDocument()
  })

  it('shows 403 inside the layout when the permission is missing and hides the menu item', async () => {
    signIn(['system:role:view'])
    renderAt('/system/users')
    expect(await screen.findByText('抱歉，您没有权限访问该页面')).toBeInTheDocument()
    // Children live in a hover flyout.
    await userEvent.hover(screen.getByRole('menuitem', { name: /系统管理/ }))
    expect(await screen.findByRole('menuitem', { name: '角色管理' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: '用户管理' })).not.toBeInTheDocument()
  })

  it('hides a parent menu when no child is accessible', async () => {
    signIn([])
    renderAt('/dashboard')
    await screen.findByRole('menuitem', { name: /组件展示/ })
    expect(screen.queryByRole('menuitem', { name: '系统管理' })).not.toBeInTheDocument()
  })

  it('renders 404 for unknown paths and 500 on the /500 route', async () => {
    signIn(['*'])
    const first = renderAt('/no/such/page')
    expect(await screen.findByText('抱歉，您访问的页面不存在')).toBeInTheDocument()
    first.dispose()
  })

  it('renders the 500 page', async () => {
    renderAt('/500')
    expect(await screen.findByText('抱歉，页面出错了')).toBeInTheDocument()
  })

  it('logs out back to /login', async () => {
    signIn(['*'])
    const router = renderAt('/dashboard')
    await userEvent.click(await screen.findByText('Tester'))
    await userEvent.click(await screen.findByText('退出登录'))
    await screen.findByRole('button', { name: /登\s*录/ })
    expect(router.state.location.pathname).toBe('/login')
    expect(useAuthStore.getState().token).toBeNull()
  })
})
