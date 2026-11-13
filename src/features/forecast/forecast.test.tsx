import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import AppProviders from '@/app/AppProviders'
import '@/app/setup-request'
import { useAuthStore } from '@/features/auth'
import { resetDb } from '@/mocks/db'
import { handlers } from '@/mocks/handlers'
import { queryClient } from '@/shared/request/query-client'
import ElemChangeRatesPage from './pages/ElemChangeRatesPage'
import JhsChangeRatesPage from './pages/JhsChangeRatesPage'
import StudentClassPage from './pages/StudentClassPage'

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

describe('student class page', () => {
  it('switches between elementary and junior high, and imports', async () => {
    renderPage(<StudentClassPage />)
    expect(await screen.findByText('共 20 条')).toBeInTheDocument()
    expect(screen.getAllByText('儿童数1年级').length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('radio', { name: '初中' }))
    expect(await screen.findByText('共 10 条')).toBeInTheDocument()
    expect(screen.getAllByText('学生数1年级').length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('button', { name: /导入数据/ }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.upload(
      dialog.querySelector('input[type="file"]')!,
      new File(['x'], 'class.xlsm'),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: /执\s*行/ }))
    expect((await screen.findAllByText('已完成')).length).toBeGreaterThan(0)
  })
})

describe('elementary change rates page', () => {
  it('edits three tables without a rebuild button, and has both exports', async () => {
    renderPage(<ElemChangeRatesPage />)
    expect(await screen.findByText('共 20 条')).toBeInTheDocument()
    // The infant tables are rebuilt elsewhere.
    expect(screen.queryByRole('button', { name: '集计执行' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /各率登记打印/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /将来推算打印/ })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: '小学增减率' }))
    expect(await screen.findAllByText('去年小1')).not.toHaveLength(0)
    expect(await screen.findByText('共 20 条')).toBeInTheDocument()
  })
})

describe('junior high change rates page', () => {
  it('lists the table and saves an edited note', async () => {
    renderPage(<JhsChangeRatesPage />)
    expect(await screen.findByText('共 10 条')).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: '初中增减率' })).not.toBeInTheDocument()

    const notes = screen.getAllByRole('textbox', { name: '备注' })
    await userEvent.type(notes[0]!, '要確認')
    await userEvent.click(screen.getByRole('button', { name: /修改登记/ }))
    await confirmDialog()
    expect((await screen.findAllByText('已保存')).length).toBeGreaterThan(0)
  })
})
