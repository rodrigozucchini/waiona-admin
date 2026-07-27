import type { ProductMeasurementUnit } from '@/core/enums'

export interface ProductResponseDto {
  id: number
  sku: string
  name: string
  description: string
  isActive: boolean
  categoryId: number
  categoryName: string
  measurementUnit: ProductMeasurementUnit
  measurementValue: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateProductDto {
  sku: string
  name: string
  description: string
  isActive?: boolean
  categoryId: number
  measurementUnit: ProductMeasurementUnit
  measurementValue?: number
}

export type UpdateProductDto = Partial<CreateProductDto>
