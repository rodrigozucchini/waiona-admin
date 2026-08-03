import { apiRequest } from '@/core/lib/api'
import type { PaginatedResponse, SearchUsersDto, UserResponseDto } from '@/core/types'

export function getUsers(query: SearchUsersDto = {}) {
  return apiRequest<PaginatedResponse<UserResponseDto>>('/users', {
    query: { ...query },
  })
}
