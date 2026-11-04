import { z } from 'zod'

const schema = z.object({
  VITE_APP_TITLE: z.string().min(1),
  VITE_API_BASE_URL: z.string().min(1),
  VITE_USE_MOCK: z.enum(['true', 'false']).transform((v) => v === 'true'),
})

export type Env = z.infer<typeof schema>

export function parseEnv(raw: Record<string, unknown>): Env {
  const result = schema.safeParse(raw)
  if (!result.success) {
    throw new Error(`Invalid env: ${z.prettifyError(result.error)}`)
  }
  return result.data
}

export const env = parseEnv(import.meta.env)
