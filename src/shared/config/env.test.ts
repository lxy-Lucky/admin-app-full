import { parseEnv } from './env'

describe('parseEnv', () => {
  it('parses valid env', () => {
    const env = parseEnv({
      VITE_APP_TITLE: 'Admin',
      VITE_API_BASE_URL: '/api',
      VITE_USE_MOCK: 'true',
    })
    expect(env.VITE_USE_MOCK).toBe(true)
  })

  it('throws on invalid values', () => {
    expect(() => parseEnv({ VITE_USE_MOCK: 'maybe' })).toThrow(/Invalid env/)
  })
})
