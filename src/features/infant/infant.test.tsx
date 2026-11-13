import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import AppProviders from '@/app/AppProviders'
import '@/app/setup-request'
import { useAuthStore } from '@/features/auth'
import { resetDb } from '@/mocks/db'
import { handlers } from '@/mocks/handlers'
import { queryClient } from '@/shared/request/query-client'
import AnbunTorokuPage from './pages/AnbunTorokuPage'
import FumeiAreaPage from './pages/FumeiAreaPage'
import RoutineAnbunPage from './pages/RoutineAnbunPage'
import Summary1Page from './pages/Summary1Page'
import Summary2Page from './pages/Summary2Page'
import Summary3Page from './pages/Summary3Page'
import SummaryRatesPage from './pages/SummaryRatesPage'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())
beforeEach(() => {
  resetDb()
  queryClient.clear()
  useAuthStore.getState().setSession({ token: 'mock-token-admin', permissions: ['*'] })
})

const renderPage = (page: React.ReactNode) => render(<AppProviders>{page}</AppProviders>)
const confirmDialog = async () => {
  const dialog = await screen.findByRole('dialog')
  await userEvent.click(within(dialog).getByRole('button', { name: /确\s*定/ }))
}

describe('fumei area page', () => {
  it('lists the result with who ran it, and re-runs after confirmation', async () => {
    renderPage(<FumeiAreaPage />)
    expect(await screen.findByText('共 40 条')).toBeInTheDocument()
    expect(await screen.findByText(/集计执行者：Admin/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '集计执行' }))
    await confirmDialog()
    expect(await screen.findAllByText('已完成')).not.toHaveLength(0)
  })
})

describe('summary 1 page', () => {
  it('imports the input sheet and highlights the rows it added', async () => {
    renderPage(<Summary1Page />)
    expect(await screen.findByText('共 25 条')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '集计执行' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.upload(
      dialog.querySelector('input[type="file"]')!,
      new File(['x'], 'sheet.xlsx'),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: /执\s*行/ }))
    expect(await screen.findAllByText('已完成')).not.toHaveLength(0)
  })
})

describe('summary 2 and 3 pages', () => {
  it('summary 2 shows "no transfer" for areas without a receiving school', async () => {
    renderPage(<Summary2Page />)
    expect(await screen.findByText('共 14 条')).toBeInTheDocument()
    expect(screen.getAllByText('（无接收）').length).toBeGreaterThan(0)
  })

  it('summary 3 flags negative counts', async () => {
    renderPage(<Summary3Page />)
    expect(await screen.findByText('共 14 条')).toBeInTheDocument()
    expect(screen.getAllByText('-2').length).toBeGreaterThan(0)
  })
})

describe('anbun registration page', () => {
  it('switches between the automatic result and the registered rates, and registers', async () => {
    renderPage(<AnbunTorokuPage />)
    expect(await screen.findByText('共 12 条')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: '已登记分配率' }))
    // Only the automatic result can be registered.
    await waitFor(() => expect(screen.getByRole('button', { name: /分配率登记/ })).toBeDisabled())

    await userEvent.click(screen.getByRole('radio', { name: '自动统计结果' }))
    await waitFor(() => expect(screen.getByRole('button', { name: /分配率登记/ })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: /分配率登记/ }))
    await confirmDialog()
    expect(await screen.findAllByText('已完成')).not.toHaveLength(0)
  })
})

describe('routine anbun page', () => {
  it('registers from an uploaded sheet', async () => {
    renderPage(<RoutineAnbunPage />)
    expect(await screen.findByText('共 15 条')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /分配登记/ }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.upload(
      dialog.querySelector('input[type="file"]')!,
      new File(['x'], 'results.xlsx'),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: /执\s*行/ }))
    expect(await screen.findAllByText('已完成')).not.toHaveLength(0)
  })
})

describe('summary rates page', () => {
  it('refuses to save "other" without a rate, then saves once it is typed', async () => {
    renderPage(<SummaryRatesPage />)
    expect(await screen.findByText('共 20 条')).toBeInTheDocument()

    // This row has no adopted rate yet.
    const row = screen.getByText('中第4小学校').closest('tr')!
    const other = within(row).getAllByRole('radio')[2]!
    await userEvent.click(other)
    await userEvent.click(screen.getByRole('button', { name: /修改登记/ }))
    expect(await screen.findByText(/选择「其他」时请输入其他率/)).toBeInTheDocument()

    await userEvent.type(within(row).getByRole('spinbutton'), '0.9')
    await userEvent.click(screen.getByRole('button', { name: /修改登记/ }))
    await confirmDialog()
    expect(await screen.findAllByText('已保存')).not.toHaveLength(0)
    expect(await screen.findByText(/更新者：Admin/)).toBeInTheDocument()
  })

  it('switches to the enrolment-rate table', async () => {
    renderPage(<SummaryRatesPage />)
    expect(await screen.findByText('共 20 条')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: '就学率表' }))
    expect(await screen.findAllByText('今年小一')).not.toHaveLength(0)
  })
})
