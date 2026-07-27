export interface ComboItemDto {
  productId: number
  productName: string
  quantity: number
}

export interface ComboResponseDto {
  id: number
  name: string
  description: string
  isActive: boolean
  categoryId: number
  categoryName: string
  items: ComboItemDto[]
  createdAt: string
  updatedAt: string
}

export interface CreateComboItemDto {
  productId: number
  quantity: number
}

export interface CreateComboDto {
  name: string
  description: string
  isActive?: boolean
  categoryId: number
  items: CreateComboItemDto[]
}

// Si se manda `items`, reemplaza la lista completa — no hay merge parcial de items.
export type UpdateComboDto = Partial<Omit<CreateComboDto, 'items'>> & {
  items?: CreateComboItemDto[]
}
