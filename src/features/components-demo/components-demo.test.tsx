import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AppProviders from '@/app/AppProviders'
import { queryClient } from '@/shared/request/query-client'
import ButtonsDemoPage from './pages/ButtonsDemoPage'
import FeedbackDemoPage from './pages/FeedbackDemoPage'
import FormDemoPage from './pages/FormDemoPage'
import InputsDemoPage from './pages/InputsDemoPage'
import TableDemoPage from './pages/TableDemoPage'

beforeEach(() => queryClient.clear())

const renderPage = (page: React.ReactNode) =>
  render(
    <AppProviders>
      <MemoryRouter>{page}</MemoryRouter>
    </AppProviders>,
  )

describe('components demo pages', () => {
  it('form: shows translated validation errors on empty submit', async () => {
    renderPage(<FormDemoPage />)
    await userEvent.click(screen.getByRole('button', { name: /提\s*交/ }))
    expect((await screen.findAllByText('此项必填')).length).toBeGreaterThan(0)
  })

  it('table: lists local data with paging', async () => {
    renderPage(<TableDemoPage />)
    expect(await screen.findByText('Member 01')).toBeInTheDocument()
    expect(screen.getByText('共 35 条')).toBeInTheDocument()
  })

  it('renders the other pages', () => {
    renderPage(
      <>
        <InputsDemoPage />
        <FeedbackDemoPage />
        <ButtonsDemoPage />
      </>,
    )
    expect(screen.getByText('文本输入')).toBeInTheDocument()
    expect(screen.getByText('操作确认（ConfirmAction）')).toBeInTheDocument()
    expect(screen.getByText('按钮类型')).toBeInTheDocument()
  })
})
