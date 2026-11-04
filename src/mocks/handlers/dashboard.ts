import { http } from 'msw/http'
import type { DashboardOverview } from '@/features/dashboard/types'
import { db, roles } from '../db'
import { api, authorize, respond } from '../utils'

export const dashboardHandlers = [
  http.get(api('/dashboard/overview'), ({ request }) => {
    const auth = authorize(request)
    if (!auth.ok) return auth.response
    const overview: DashboardOverview = {
      cards: [
        { key: 'users', value: db.users.length, trend: 12.5 },
        {
          key: 'enabledUsers',
          value: db.users.filter((u) => u.status === 'enabled').length,
          trend: 8.1,
        },
        { key: 'roles', value: roles.length, trend: 0 },
        { key: 'requests', value: 12840, trend: -3.2 },
      ],
    }
    return respond(overview)
  }),
]
