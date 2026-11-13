import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { debugHandlers } from './debug'
import { forecastHandlers } from './forecast'
import { infantHandlers } from './infant'
import { masterHandlers } from './master'
import { systemHandlers } from './system'

export const handlers = [
  ...authHandlers,
  ...systemHandlers,
  ...masterHandlers,
  ...infantHandlers,
  ...forecastHandlers,
  ...dashboardHandlers,
  ...debugHandlers,
]
