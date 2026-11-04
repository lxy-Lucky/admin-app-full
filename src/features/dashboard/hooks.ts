import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from './api'
import { dashboardKeys } from './keys'

export function useOverview() {
  return useQuery({
    queryKey: dashboardKeys.detail('overview'),
    queryFn: dashboardApi.overview,
    staleTime: 60_000,
  })
}
