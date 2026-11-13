import { useQuery, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useTranslation } from 'react-i18next'
import { wardApi } from './api'
import { wardKeys } from './keys'
import type { ImportResult } from './types'

export function useWards() {
  return useQuery({ queryKey: wardKeys.all, queryFn: wardApi.list, staleTime: 5 * 60_000 })
}

/** After a successful import: report the row count and refresh the given query keys. */
export function useImportDone(invalidateKeys: readonly (readonly unknown[])[]) {
  const { t } = useTranslation('master')
  const { modal } = App.useApp()
  const queryClient = useQueryClient()

  return async (result: ImportResult) => {
    modal.success({ title: t('import.done'), content: t('import.count', { count: result.count }) })
    await Promise.all(invalidateKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
  }
}
