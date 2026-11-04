/**
 * Query key factory. Usage:
 *   const userKeys = createQueryKeys('users')
 *   useQuery({ queryKey: userKeys.list({ page: 1 }), ... })
 *   queryClient.invalidateQueries({ queryKey: userKeys.lists() })
 */
export function createQueryKeys<S extends string>(scope: S) {
  return {
    all: [scope] as const,
    lists: () => [scope, 'list'] as const,
    list: <F extends object>(filters?: F) => [scope, 'list', filters ?? {}] as const,
    details: () => [scope, 'detail'] as const,
    detail: (id: string | number) => [scope, 'detail', id] as const,
  }
}
