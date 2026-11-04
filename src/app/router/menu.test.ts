import { buildMenuItems, findSelectedKey, getOpenKeys } from './menu'
import type { AppRoute } from './types'

const routes: AppRoute[] = [
  { path: 'dashboard', titleKey: 'menu.dashboard' },
  {
    path: 'system',
    titleKey: 'menu.system',
    children: [
      { path: 'users', titleKey: 'menu.users', permission: 'u' },
      { path: 'roles', titleKey: 'menu.roles', permission: 'r', hideInMenu: true },
    ],
  },
]
const t = (k: string) => k

describe('menu', () => {
  it('filters by permission and drops empty parents', () => {
    const all = buildMenuItems(routes, t, () => true)
    expect(all.map((i) => i?.key)).toEqual(['/dashboard', '/system'])

    const none = buildMenuItems(routes, t, (p) => !p)
    expect(none.map((i) => i?.key)).toEqual(['/dashboard'])
  })

  it('hides hideInMenu routes', () => {
    const items = buildMenuItems(routes, t, () => true)
    const system = items[1] as { children: { key: string }[] }
    expect(system.children.map((c) => c.key)).toEqual(['/system/users'])
  })

  it('finds the deepest selected key and open keys', () => {
    const items = buildMenuItems(routes, t, () => true)
    expect(findSelectedKey(items, '/system/users/42')).toBe('/system/users')
    expect(findSelectedKey(items, '/nope')).toBeUndefined()
    expect(getOpenKeys('/system/users')).toEqual(['/system'])
    expect(getOpenKeys('/dashboard')).toEqual([])
  })
})
