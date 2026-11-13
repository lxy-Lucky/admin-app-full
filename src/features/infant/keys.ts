/** One scope per page; the list and the execute info of a page share it so one invalidation refreshes both. */
export const INFANT_SCOPES = {
  fumei: 'infant-fumei',
  summary1: 'infant-summary1',
  summary2: 'infant-summary2',
  summary3: 'infant-summary3',
  anbun: 'infant-anbun',
  routine: 'infant-routine',
  changeRates: 'infant-change-rates',
  enrolRates: 'infant-enrol-rates',
} as const

export const listKey = (scope: string) => [scope, 'list'] as const
export const infoKey = (scope: string, year: number) => [scope, 'info', year] as const
