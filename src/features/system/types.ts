export type UserStatus = 'enabled' | 'disabled'

export interface Role {
  id: number
  code: string
  name: string
}

export interface User {
  id: number
  username: string
  name: string
  email: string
  roleId: number
  status: UserStatus
  createdAt: string
}

export type UserInput = Omit<User, 'id' | 'createdAt'>

export interface UserListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: UserStatus
  roleId?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}
