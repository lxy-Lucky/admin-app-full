import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import AppProviders from '@/app/AppProviders'
import '@/app/setup-request'
import { useAuthStore } from '@/features/auth'
import { resetDb } from '@/mocks/db'
import { handlers } from '@/mocks/handlers'
import { queryClient } from '@/shared/request/query-client'
import DashboardPage from './pages/DashboardPage'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())
beforeEach(() => {
  resetDb()
  queryClient.clear()
})

const signInAs = (username: string, permissions: string[]) =>
  useAuthStore.getState().setSession({
    token: `mock-token-${username}`,
    user: { name: username },
    permissions,
  })

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <DashboardPage /> },
      { path: '/system/users', element: <div>users page</div> },
    ],
    { initialEntries: ['/'] },
  )
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('DashboardPage', () => {
  it('renders overview cards from the API with trends', async () => {
    signInAs('admin', ['*'])
    renderPage()
    expect(screen.getByText('欢迎回来，admin')).toBeInTheDocument()
    expect(await screen.findByText('57')).toBeInTheDocument()
    expect(screen.getByText('12,840')).toBeInTheDocument()
    for (const title of ['用户总数', '启用用户', '角色数', '今日请求']) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
    expect(screen.getByText(/12\.5%/)).toBeInTheDocument()
    expect(screen.getByText(/3\.2%/)).toBeInTheDocument()
  })

  it('keeps reserved chart placeholders', async () => {
    signInAs('admin', ['*'])
    renderPage()
    expect(await screen.findByText('访问趋势')).toBeInTheDocument()
    expect(screen.getByText('用户分布')).toBeInTheDocument()
    expect(screen.getAllByText('图表区域（预留）')).toHaveLength(2)
  })

  it('shows only the shortcuts the user may open, and they navigate', async () => {
    signInAs('editor', ['system:user:view'])
    renderPage()
    const quick = (await screen.findByText('快捷入口')).closest('.ant-card')! as HTMLElement
    expect(within(quick).getByText('用户管理')).toBeInTheDocument()
    expect(within(quick).queryByText('角色管理')).not.toBeInTheDocument()
    await userEvent.click(within(quick).getByText('用户管理'))
    expect(await screen.findByText('users page')).toBeInTheDocument()
  })

  it('hides the quick actions card when nothing is allowed', async () => {
    signInAs('viewer', [])
    renderPage()
    await screen.findByText('用户总数')
    expect(screen.queryByText('快捷入口')).not.toBeInTheDocument()
  })
})
