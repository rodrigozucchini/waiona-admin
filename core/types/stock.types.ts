import type {
  StockLocationType,
  StockOperationType,
  StockFlow,
  StockReferenceType,
  StockWriteOffReason,
} from '@/core/enums'

export interface StockLocationResponseDto {
  id: number
  name: string
  type: StockLocationType
  address: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateStockLocationDto {
  name: string
  type: StockLocationType
  address?: string
}

export type UpdateStockLocationDto = Partial<CreateStockLocationDto>

export interface StockItemResponseDto {
  id: number
  productId: number
  productName: string
  locationId: number
  locationName: string
  quantityCurrent: number
  quantityReserved: number
  quantityAvailable: number
  stockMin: number
  stockCritical: number
  createdAt: string
  updatedAt: string
}

export interface StockMovementResponseDto {
  id: number
  stockItemId: number
  operationType: StockOperationType
  stockFlow: StockFlow
  quantity: number
  referenceType: StockReferenceType
  // null cuando referenceType es MANUAL
  referenceId: number | null
  createdAt: string
}

export interface StockItemWithMovementsResponseDto extends StockItemResponseDto {
  movements: StockMovementResponseDto[]
}

export interface CreateStockItemDto {
  productId: number
  locationId: number
  stockMin: number
  stockCritical: number
}

export interface AddStockDto {
  productId: number
  locationId: number
  quantity: number
}

// dispatch/release normalmente los dispara el propio backend al cambiar el
// estado de una orden — se exponen igual para ajustes manuales desde el admin.
export interface DispatchStockDto {
  productId: number
  locationId: number
  quantity: number
  orderId: number
}

export interface ReleaseStockDto {
  productId: number
  locationId: number
  quantity: number
  orderId: number
}

export interface UpdateStockThresholdsDto {
  stockMin?: number
  stockCritical?: number
}

export interface CreateStockWriteOffDto {
  stockItemId: number
  quantity: number
  reason: StockWriteOffReason
  description?: string
  attachments?: string[]
}

// La cantidad queda fija al crearse vía POST /stock-items/write-off — no editable acá.
export interface UpdateStockWriteOffDto {
  reason?: StockWriteOffReason
  description?: string
  attachments?: string[]
}

export interface StockWriteOffResponseDto {
  id: number
  stockItemId: number
  movementId: number
  quantity: number
  reason: StockWriteOffReason
  description: string | null
  attachments: string[]
  reportedBy: number
  createdAt: string
  updatedAt: string
}
