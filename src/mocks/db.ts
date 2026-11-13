import dayjs from 'dayjs'
import type { Role, User } from '@/features/system/types'
import { resetForecastDb } from './forecast-db'
import { resetInfantDb } from './infant-db'
import { resetMasterDb } from './master-db'

export const roles: Role[] = [
  { id: 1, code: 'admin', name: '管理员' },
  { id: 2, code: 'editor', name: '编辑' },
  { id: 3, code: 'viewer', name: '访客' },
]

/** Demo accounts. Permission codes drive menus, routes and <Auth> buttons. */
export const accounts: Record<string, { password: string; name: string; permissions: string[] }> = {
  admin: { password: 'admin123', name: 'Admin', permissions: ['*'] },
  editor: {
    password: 'editor123',
    name: 'Editor',
    permissions: ['system:user:view', 'system:user:add', 'system:user:edit'],
  },
  viewer: { password: 'viewer123', name: 'Viewer', permissions: ['system:role:view'] },
}

const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴']
const givenNames = ['伟', '芳', '娜', '敏', '静', '磊', '洋', '艳', '勇', '杰']

function seedUsers(): User[] {
  return Array.from({ length: 57 }, (_, i) => ({
    id: i + 1,
    username: `user${String(i + 1).padStart(3, '0')}`,
    name: `${surnames[i % surnames.length]}${givenNames[(i * 7) % givenNames.length]}`,
    email: `user${i + 1}@example.com`,
    roleId: roles[i % roles.length]!.id,
    status: i % 5 === 0 ? 'disabled' : 'enabled',
    createdAt: dayjs('2026-01-01').add(i, 'day').format('YYYY-MM-DD HH:mm:ss'),
  }))
}

export const db = { users: seedUsers(), nextUserId: 58 }

/** In-memory data resets on page reload; tests call this between cases. */
export function resetDb() {
  db.users = seedUsers()
  db.nextUserId = 58
  resetMasterDb()
  resetInfantDb()
  resetForecastDb()
}
