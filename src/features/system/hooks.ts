import { useQuery } from '@tanstack/react-query'
import { roleApi } from './api'
import { roleKeys } from './keys'

export function useRoles() {
  return useQuery({ queryKey: roleKeys.all, queryFn: roleApi.list, staleTime: 5 * 60_000 })
}
