export interface CategoryResponseDto {
  id: number
  name: string
  description: string | null
  isActive: boolean
  parentId: number | null
  createdAt: string
  updatedAt: string
}

export interface CategoryTreeResponseDto {
  id: number
  name: string
  children: CategoryTreeResponseDto[]
}

export interface CreateCategoryDto {
  name: string
  description?: string
  parentId?: number | null
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>
