import type { ParseKeys } from 'i18next'

/** i18n key (namespace `layout`) used for menu entries and breadcrumbs. */
export type RouteTitleKey = ParseKeys<'layout'>

/** Attached to every route as `handle`; read through useMatches(). */
export interface RouteHandle {
  titleKey?: RouteTitleKey
  /** Permission code required to open this route (inherited by children). */
  permission?: string
}
