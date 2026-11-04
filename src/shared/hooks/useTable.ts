import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TableProps } from 'antd'
import { useState } from 'react'
import type { PageResult } from '@/shared/types/api'

export type SortOrder = 'asc' | 'desc'

/** What the fetcher receives: your filters plus paging and server-side sorting. */
export type TableQuery<F extends object> = F & {
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: SortOrder
}

interface UseTableOptions<T, F extends object> {
  /** Base key (e.g. userKeys.lists()); invalidating it refreshes every page/filter combo. */
  queryKey: readonly unknown[]
  fetcher: (query: TableQuery<F>) => Promise<PageResult<T>>
  defaultFilters?: F
  defaultPageSize?: number
}

/** Server-driven table state (paging, filters, sorting) on top of TanStack Query. */
export function useTable<T, F extends object = Record<never, never>>({
  queryKey,
  fetcher,
  defaultFilters = {} as F,
  defaultPageSize = 10,
}: UseTableOptions<T, F>) {
  const [filters, setFilters] = useState<F>(defaultFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [sort, setSort] = useState<{ field?: string; order?: SortOrder }>({})

  const query: TableQuery<F> = {
    ...filters,
    page,
    pageSize,
    sortField: sort.field,
    sortOrder: sort.order,
  }

  const result = useQuery({
    queryKey: [...queryKey, query],
    queryFn: async () => {
      const data = await fetcher(query)
      // Deleting the last row of the last page leaves it empty: step back to the new last page.
      if (data.list.length === 0 && data.total > 0 && query.page > 1) {
        setPage(Math.max(1, Math.ceil(data.total / query.pageSize)))
      }
      return data
    },
    placeholderData: keepPreviousData,
  })

  const onChange: TableProps<T>['onChange'] = (pagination, _filters, sorter) => {
    setPage(pagination.current ?? 1)
    setPageSize(pagination.pageSize ?? defaultPageSize)
    const s = Array.isArray(sorter) ? sorter[0] : sorter
    const field = s?.order ? String(s.columnKey ?? s.field) : undefined
    setSort({
      field,
      order: s?.order === 'ascend' ? 'asc' : s?.order === 'descend' ? 'desc' : undefined,
    })
  }

  return {
    /** Spread into <DataTable /> / antd Table. */
    tableProps: {
      dataSource: result.data?.list,
      loading: result.isFetching,
      pagination: { current: page, pageSize, total: result.data?.total ?? 0 },
      onChange,
    } satisfies Pick<TableProps<T>, 'dataSource' | 'loading' | 'pagination' | 'onChange'>,
    filters,
    /** Merge filter values and go back to page 1. */
    setFilters: (patch: Partial<F>) => {
      setFilters((prev) => ({ ...prev, ...patch }))
      setPage(1)
    },
    resetFilters: () => {
      setFilters(defaultFilters)
      setPage(1)
    },
    refetch: result.refetch,
    query,
  }
}
