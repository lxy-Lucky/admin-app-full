import { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { ApiError, axiosInstance, configureRequest, http, isRetryableError } from '@/shared/request'

type Handler = (config: InternalAxiosRequestConfig) => unknown

function mockAdapter(handler: Handler) {
  axiosInstance.defaults.adapter = async (config) => {
    const result = await handler(config)
    return { data: result, status: 200, statusText: 'OK', headers: {}, config }
  }
}

function mockHttpError(status: number, data: unknown = {}) {
  axiosInstance.defaults.adapter = async (config) => {
    throw new AxiosError('fail', 'ERR_BAD_RESPONSE', config, null, {
      status,
      statusText: '',
      headers: {},
      config,
      data,
    })
  }
}

const hooks = {
  notifyError: vi.fn(),
  onUnauthorized: vi.fn(),
  reportError: vi.fn(),
  getToken: vi.fn<() => string | null>(() => null),
}

beforeEach(() => {
  vi.clearAllMocks()
  hooks.getToken.mockReturnValue(null)
  configureRequest(hooks)
})

describe('request', () => {
  it('unwraps the envelope and returns data', async () => {
    mockAdapter(() => ({ code: 0, data: { id: 1 }, msg: 'ok' }))
    await expect(http.get<{ id: number }>('/x')).resolves.toEqual({ id: 1 })
    expect(hooks.notifyError).not.toHaveBeenCalled()
  })

  it('injects token and Accept-Language', async () => {
    hooks.getToken.mockReturnValue('abc')
    let seen: AxiosRequestConfig | undefined
    mockAdapter((config) => {
      seen = config
      return { code: 0, data: null, msg: '' }
    })
    await http.get('/x')
    expect(seen?.headers?.Authorization).toBe('Bearer abc')
    expect(seen?.headers?.['Accept-Language']).toBe('zh-CN')
  })

  it('rejects business errors with ApiError and notifies', async () => {
    mockAdapter(() => ({ code: 1001, data: null, msg: '名称重复' }))
    const err = await http.post('/x').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ kind: 'business', code: 1001, message: '名称重复' })
    expect(hooks.notifyError).toHaveBeenCalledWith('名称重复')
    expect(hooks.reportError).toHaveBeenCalledOnce()
  })

  it('does not notify when silent', async () => {
    mockAdapter(() => ({ code: 1001, data: null, msg: 'x' }))
    await expect(http.get('/x', { silent: true })).rejects.toBeInstanceOf(ApiError)
    expect(hooks.notifyError).not.toHaveBeenCalled()
  })

  it('treats business 401 as auth error', async () => {
    mockAdapter(() => ({ code: 401, data: null, msg: '' }))
    await expect(http.get('/x')).rejects.toMatchObject({ kind: 'auth' })
    expect(hooks.onUnauthorized).toHaveBeenCalledOnce()
  })

  it('treats HTTP 401 as auth error', async () => {
    mockHttpError(401)
    await expect(http.get('/x')).rejects.toMatchObject({ kind: 'auth', status: 401 })
    expect(hooks.onUnauthorized).toHaveBeenCalledOnce()
  })

  it('maps 500 to a server error message', async () => {
    mockHttpError(500)
    await expect(http.get('/x')).rejects.toMatchObject({ kind: 'http', status: 500 })
    expect(hooks.notifyError).toHaveBeenCalledWith('服务器异常，请稍后重试')
  })

  it('maps missing response to network error', async () => {
    axiosInstance.defaults.adapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    }
    await expect(http.get('/x')).rejects.toMatchObject({ kind: 'network' })
  })

  it('maps ECONNABORTED to timeout', async () => {
    axiosInstance.defaults.adapter = async (config) => {
      throw new AxiosError('timeout', 'ECONNABORTED', config)
    }
    await expect(http.get('/x')).rejects.toMatchObject({ kind: 'timeout' })
  })
})

describe('isRetryableError', () => {
  it('retries network/timeout/5xx only', () => {
    expect(isRetryableError(new ApiError({ kind: 'network', message: '' }))).toBe(true)
    expect(isRetryableError(new ApiError({ kind: 'timeout', message: '' }))).toBe(true)
    expect(isRetryableError(new ApiError({ kind: 'http', status: 503, message: '' }))).toBe(true)
    expect(isRetryableError(new ApiError({ kind: 'http', status: 404, message: '' }))).toBe(false)
    expect(isRetryableError(new ApiError({ kind: 'business', code: 1, message: '' }))).toBe(false)
    expect(isRetryableError(new Error('x'))).toBe(false)
  })
})
