import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TableProps } from 'antd'
import { useState } from 'react'
import type { PageResult } from '@/shared/types/api'

export type SortOrder = 'asc' | 'desc'

/**
 * 表格请求参数
 *
 * 在业务筛选条件基础上，统一附加分页和服务端排序参数。
 * 作为 fetcher 的入参。
 */
export type TableQuery<F extends object> = F & {
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: SortOrder
}

interface UseTableOptions<T, F extends object> {
  /** 基础 Query Key，失效时可刷新该表格下所有分页和筛选组合。 */
  queryKey: readonly unknown[]
  fetcher: (query: TableQuery<F>) => Promise<PageResult<T>>
  defaultFilters?: F
  defaultPageSize?: number
}

/**
 * 服务端表格状态管理 Hook
 *
 * 基于 TanStack Query 统一管理分页、筛选、排序和数据请求，
 * 支持保留上一页数据，减少分页切换时的界面闪烁。
 */
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
      // 删除最后一页的最后一条数据后，当前页可能超出总页数，需要回退到新的最后一页。
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
    /** 可直接展开传入 DataTable / Ant Design Table 的属性。 */
    tableProps: {
      dataSource: result.data?.list,
      loading: result.isFetching,
      pagination: { current: page, pageSize, total: result.data?.total ?? 0 },
      onChange,
    } satisfies Pick<TableProps<T>, 'dataSource' | 'loading' | 'pagination' | 'onChange'>,
    filters,
    /** 合并筛选条件，并重置到第一页。 */
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
