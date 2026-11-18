import { authHandlers } from './auth'
import { debugHandlers } from './debug'
import { masterHandlers } from './master'
import { systemHandlers } from './system'

export const handlers = [...authHandlers, ...systemHandlers, ...masterHandlers, ...debugHandlers]
