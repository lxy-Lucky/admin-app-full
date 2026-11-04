export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'business' | 'auth'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  /** Business code from the envelope, if any. */
  readonly code?: number
  /** HTTP status, if a response was received. */
  readonly status?: number

  constructor(init: { kind: ApiErrorKind; message: string; code?: number; status?: number }) {
    super(init.message)
    this.name = 'ApiError'
    this.kind = init.kind
    if (init.code !== undefined) this.code = init.code
    if (init.status !== undefined) this.status = init.status
  }
}

/** Worth retrying: transport problems and 5xx. Never business/auth/4xx errors. */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.kind === 'network' || error.kind === 'timeout') return true
  return error.kind === 'http' && (error.status ?? 0) >= 500
}
