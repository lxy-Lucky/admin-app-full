import { http } from '@/shared/request'
import type { PageResult } from '@/shared/types/api'
import type { Role, User, UserInput, UserListParams } from './types'

export const userApi = {
  list: (params: UserListParams) => http.get<PageResult<User>>('/system/users', { params }),
  create: (input: UserInput) => http.post<User, UserInput>('/system/users', input),
  update: (id: number, input: Partial<UserInput>) =>
    http.put<User, Partial<UserInput>>(`/system/users/${id}`, input),
  remove: (id: number) => http.delete<null>(`/system/users/${id}`),
}

export const roleApi = {
  list: () => http.get<Role[]>('/system/roles'),
}
