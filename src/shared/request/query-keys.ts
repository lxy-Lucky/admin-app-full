/**
 * TanStack Query Key 工厂
 *
 * 按业务模块统一生成查询缓存 Key。
 *
 * - all：模块下所有查询的根 Key。
 * - lists：所有列表查询的公共 Key。
 * - list：指定筛选条件的列表查询 Key。
 * - details：所有详情查询的公共 Key。
 * - detail：指定 ID 的详情查询 Key。
 *
 * 可利用 Key 的层级关系进行精确查询和批量缓存失效。
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
