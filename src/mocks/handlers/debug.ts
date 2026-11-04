import { delay } from 'msw'
import { http } from 'msw/http'
import { HttpResponse } from 'msw/http'
import { api } from '../utils'

/** Endpoints for exercising error handling by hand, e.g. http.get('/mock/status/500'). */
export const debugHandlers = [
  http.get(api('/mock/status/:code'), ({ params }) => {
    const status = Number(params.code)
    return HttpResponse.json({ code: status, data: null, msg: `Mock ${status}` }, { status })
  }),
  // Never resolves: use it to see the request timeout path.
  http.get(api('/mock/timeout'), async () => {
    await delay('infinite')
    return HttpResponse.json({})
  }),
]
