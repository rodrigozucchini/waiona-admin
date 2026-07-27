export interface TaxResponseDto {
  id: number
  code: string
  name: string
  value: number
  isGlobal: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaxDto {
  code: string
  name: string
  value: number
  isGlobal?: boolean
}

export type UpdateTaxDto = Partial<CreateTaxDto>

export interface ProductTaxResponseDto {
  id: number
  productId: number
  taxId: number
  tax: TaxResponseDto
  createdAt: string
  updatedAt: string
}

// El backend rechaza con 400 si el impuesto es isGlobal: true — esos se aplican
// automáticamente a todo, no se asignan por producto.
export interface CreateProductTaxDto {
  taxId: number
}
