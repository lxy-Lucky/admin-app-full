import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import AppProviders from '@/app/AppProviders'
import '@/app/setup-request'
import { useAuthStore } from '@/features/auth'
import { resetDb } from '@/mocks/db'
import { handlers } from '@/mocks/handlers'
import { queryClient } from '@/shared/request/query-client'
import GakusekiDbPage from './pages/GakusekiDbPage'
import JukiDbPage from './pages/JukiDbPage'
import SchoolAreaInfoPage from './pages/SchoolAreaInfoPage'
import SchoolPage from './pages/SchoolPage'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())
beforeEach(() => {
  resetDb()
  queryClient.clear()
  useAuthStore.getState().setSession({ token: 'mock-token-admin', permissions: ['*'] })
})

const renderPage = (page: React.ReactNode) => render(<AppProviders>{page}</AppProviders>)

describe('juki DB page', () => {
  it('lists the current year and imports a file', async () => {
    renderPage(<JukiDbPage />)
    expect(await screen.findByText('共 120 条')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /导入数据/ }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /执\s*行/ }))
    expect(await within(dialog).findByText('请选择文件')).toBeInTheDocument()

    const file = new File(['a,b'], 'juki.csv', { type: 'text/csv' })
    await userEvent.upload(dialog.querySelector('input[type="file"]')!, file)
    await userEvent.click(within(dialog).getByRole('button', { name: /执\s*行/ }))

    expect(await screen.findByText('导入条数：80')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('共 80 条')).toBeInTheDocument())
  })
})

describe('school area info page', () => {
  it('lists rows with joined banchi codes', async () => {
    renderPage(<SchoolAreaInfoPage />)
    expect(await screen.findByText('共 80 条')).toBeInTheDocument()
  })
})

describe('school page', () => {
  it('filters by kana and by school type', async () => {
    renderPage(<SchoolPage />)
    expect(await screen.findByText('共 30 条')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: '初中' }))
    await userEvent.click(screen.getByRole('button', { name: /搜\s*索/ }))
    expect(await screen.findByText('共 10 条')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /重\s*置/ }))
    expect(await screen.findByText('共 30 条')).toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox'), 'ダイ1ショウ')
    await userEvent.click(screen.getByRole('button', { name: /搜\s*索/ }))
    expect(await screen.findByText('共 1 条')).toBeInTheDocument()
  })
})

describe('gakuseki DB page', () => {
  it('shows per-ward import status and switches school type', async () => {
    renderPage(<GakusekiDbPage />)
    expect(await screen.findByText('共 48 条')).toBeInTheDocument()

    await userEvent.click(screen.getByText('学籍DB导入状况'))
    expect(await screen.findAllByText('鶴見区：已导入')).not.toHaveLength(0)
    expect(screen.getAllByText('港南区：未导入')).toHaveLength(2)

    await userEvent.click(screen.getByRole('radio', { name: '初中' }))
    expect(await screen.findByText('共 24 条')).toBeInTheDocument()
  })
})
