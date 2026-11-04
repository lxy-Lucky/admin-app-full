import { z } from 'zod'

/** Messages are i18n keys under `auth:validation.*`, resolved at render time. */
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'required'),
  password: z.string().min(1, 'required'),
})

export type LoginForm = z.infer<typeof loginSchema>
