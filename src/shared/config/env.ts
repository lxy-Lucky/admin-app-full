import { z } from 'zod'

/**
 * 环境变量配置
 *
 * 使用 Zod 校验 Vite 环境变量，并统一转换为具有明确类型的配置对象。
 */
const schema = z.object({
  VITE_APP_TITLE: z.string().min(1),
  VITE_API_BASE_URL: z.string().min(1),
  VITE_USE_MOCK: z.enum(['true', 'false']).transform((v) => v === 'true'),
})

export type Env = z.infer<typeof schema>

/**
 * 解析并校验环境变量。
 *
 * 校验失败时抛出包含具体错误信息的异常，避免应用使用无效配置启动。
 */
export function parseEnv(raw: Record<string, unknown>): Env {
  const result = schema.safeParse(raw)
  if (!result.success) {
    throw new Error(`Invalid env: ${z.prettifyError(result.error)}`)
  }
  return result.data
}

export const env = parseEnv(import.meta.env)
