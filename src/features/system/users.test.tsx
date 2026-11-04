import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import AppProviders from '@/app/AppProviders'
import '@/app/setup-request'
import { useAuthStore } from '@/features/auth'
import { resetDb } from '@/mocks/db'
import { handlers } from '@/mocks/handlers'
import { queryClient } from '@/shared/request/query-client'
import UsersPage from './pages/UsersPage'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())
beforeEach(() => {
  resetDb()
  queryClient.clear()
})

const signInAs = (username: string, permissions: string[]) =>
  useAuthStore.getState().setSession({ token: `mock-token-${username}`, permissions })

const renderPage = () =>
  render(
    <AppProviders>
      <UsersPage />
    </AppProviders>,
  )

describe('UsersPage', () => {
  it('lists users with paging', async () => {
    signInAs('admin', ['*'])
    renderPage()
    expect(await screen.findByText('user001')).toBeInTheDocument()
    expect(screen.getByText('共 57 条')).toBeInTheDocument()
    expect(screen.queryByText('user011')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTitle('2'))
    expect(await screen.findByText('user011')).toBeInTheDocument()
  })

  it('searches by keyword', async () => {
    signInAs('admin', ['*'])
    renderPage()
    await screen.findByText('user001')
    await userEvent.type(screen.getByPlaceholderText('搜索用户名 / 姓名 / 邮箱'), 'user057{Enter}')
    await waitFor(() => expect(screen.queryByText('user001')).not.toBeInTheDocument())
    expect(screen.getByText('user057')).toBeInTheDocument()
    expect(screen.getByText('共 1 条')).toBeInTheDocument()
  })

  it('validates the create form', async () => {
    signInAs('admin', ['*'])
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: /新增用户/ }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /确\s*定/ }))
    expect((await within(dialog).findAllByText('此项必填')).length).toBeGreaterThanOrEqual(3)
  })

  it('creates a user', async () => {
    signInAs('admin', ['*'])
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: /新增用户/ }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('用户名'), 'neo')
    await userEvent.type(within(dialog).getByLabelText('姓名'), 'Neo')
    await userEvent.type(within(dialog).getByLabelText('邮箱'), 'neo@example.com')
    await userEvent.click(within(dialog).getByLabelText('角色'))
    await userEvent.click(
      await screen.findByText('编辑', { selector: '.ant-select-item-option-content' }),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: /确\s*定/ }))

    expect(await screen.findByText('保存成功')).toBeInTheDocument()
    expect(await screen.findByText('neo')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('deletes a user after confirmation', async () => {
    signInAs('admin', ['*'])
    renderPage()
    const row = (await screen.findByText('user001')).closest('tr')!
    await userEvent.click(within(row).getByRole('button', { name: /删\s*除/ }))
    await userEvent.click(await screen.findByRole('button', { name: /确\s*定/ }))
    expect(await screen.findByText('删除成功')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('共 56 条')).toBeInTheDocument())
  })

  it('hides actions the user has no permission for', async () => {
    signInAs('editor', ['system:user:view', 'system:user:edit'])
    renderPage()
    await screen.findByText('user001')
    expect(screen.queryByRole('button', { name: /新增用户/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /删\s*除/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /编\s*辑/ }).length).toBeGreaterThan(0)
  })
})
