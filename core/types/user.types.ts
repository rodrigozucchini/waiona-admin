import type { RoleType } from '@/core/enums'
import type { PaginationQuery } from './common.types'

export interface UserProfile {
  id: number
  name: string
  lastName: string
  avatar: string | null
}

export interface UserResponseDto {
  id: number
  email: string
  isActive: boolean
  role: RoleType
  profile: UserProfile
  createdAt: string
  updatedAt: string
}

export interface UpdateUserDto {
  name?: string
  lastName?: string
  avatar?: string
}

export interface SearchUsersDto extends PaginationQuery {
  email?: string
  name?: string
}
