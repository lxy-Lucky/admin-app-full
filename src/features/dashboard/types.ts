export interface OverviewCard {
  key: 'users' | 'enabledUsers' | 'roles' | 'requests'
  value: number
  /** Percent change versus the previous period. */
  trend: number
}

export interface DashboardOverview {
  cards: OverviewCard[]
}
