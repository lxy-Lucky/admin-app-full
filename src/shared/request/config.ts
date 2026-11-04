/** Business code meaning success in the `{ code, data, msg }` envelope. */
export const SUCCESS_CODE = 0
/** Business codes treated as "not logged in / token expired". */
export const UNAUTHORIZED_CODES: readonly number[] = [401]
export const REQUEST_TIMEOUT = 15_000
