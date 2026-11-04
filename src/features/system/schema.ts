import { z } from 'zod'

/** Messages are keys under `common:validation.*`. */
export const userSchema = z.object({
  username: z.string().trim().min(1, 'required'),
  name: z.string().trim().min(1, 'required'),
  email: z.string().trim().min(1, 'required').pipe(z.email('email')),
  roleId: z.number('required'),
  status: z.enum(['enabled', 'disabled']),
})

export type UserFormValues = z.infer<typeof userSchema>
