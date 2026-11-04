import { http } from '@/shared/request'
import type { DashboardOverview } from './types'

export const dashboardApi = {
  overview: () => http.get<DashboardOverview>('/dashboard/overview'),
}
