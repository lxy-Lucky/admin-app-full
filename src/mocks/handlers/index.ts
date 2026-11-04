import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { debugHandlers } from './debug'
import { systemHandlers } from './system'

export const handlers = [...authHandlers, ...systemHandlers, ...dashboardHandlers, ...debugHandlers]
