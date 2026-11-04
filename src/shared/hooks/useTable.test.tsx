import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { PageResult } from '@/shared/types/api'
import { useTable, type TableQuery } from './useTable'

interface Row {
  id: number
}
type Filters = { keyword?: string }

function setup(fetcher: (q: TableQuery<Filters>) => Promise<PageResult<Row>>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(() => useTable<Row, Filters>({ queryKey: ['rows'], fetcher }), { wrapper })
}

const page = (list: Row[], total: number, q: TableQuery<Filters>): PageResult<Row> => ({
  list,
  total,
  page: q.page,
  pageSize: q.pageSize,
})

describe('useTable', () => {
  it('loads the first page and exposes antd table props', async () => {
    const fetcher = vi.fn(async (q: TableQuery<Filters>) => page([{ id: 1 }], 25, q))
    const { result } = setup(fetcher)
    await waitFor(() => expect(result.current.tableProps.dataSource).toEqual([{ id: 1 }]))
    expect(result.current.tableProps.pagination).toEqual({ current: 1, pageSize: 10, total: 25 })
    expect(fetcher).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 10 }))
  })

  it('changing filters resets to page 1', async () => {
    const fetcher = vi.fn(async (q: TableQuery<Filters>) => page([{ id: 1 }], 50, q))
    const { result } = setup(fetcher)
    await waitFor(() => expect(result.current.tableProps.dataSource).toBeDefined())

    act(() =>
      result.current.tableProps.onChange?.({ current: 3, pageSize: 10 }, {}, {}, {} as never),
    )
    await waitFor(() => expect(result.current.query.page).toBe(3))

    act(() => result.current.setFilters({ keyword: 'abc' }))
    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, keyword: 'abc' }),
      ),
    )
  })

  it('maps antd sorter to sortField/sortOrder', async () => {
    const fetcher = vi.fn(async (q: TableQuery<Filters>) => page([], 0, q))
    const { result } = setup(fetcher)
    await waitFor(() => expect(fetcher).toHaveBeenCalled())

    act(() =>
      result.current.tableProps.onChange?.(
        { current: 1, pageSize: 10 },
        {},
        { columnKey: 'createdAt', order: 'descend' },
        {} as never,
      ),
    )
    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortField: 'createdAt', sortOrder: 'desc' }),
      ),
    )

    act(() =>
      result.current.tableProps.onChange?.(
        { current: 1, pageSize: 10 },
        {},
        { order: null },
        {} as never,
      ),
    )
    await waitFor(() => expect(result.current.query.sortField).toBeUndefined())
  })

  it('steps back when the current page becomes empty', async () => {
    const fetcher = vi.fn(async (q: TableQuery<Filters>) =>
      q.page > 2 ? page([], 20, q) : page([{ id: q.page }], 20, q),
    )
    const { result } = setup(fetcher)
    await waitFor(() => expect(result.current.tableProps.dataSource).toBeDefined())
    act(() =>
      result.current.tableProps.onChange?.({ current: 3, pageSize: 10 }, {}, {}, {} as never),
    )
    await waitFor(() => expect(result.current.query.page).toBe(2))
  })
})
