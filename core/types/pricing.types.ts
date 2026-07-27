import type { CurrencyCode } from '@/core/enums'

export interface ProductPricingResponseDto {
  id: number
  productId: number
  currency: CurrencyCode
  unitPrice: number
  salePrice: number
  createdAt: string
  updatedAt: string
}

export interface ComboPricingResponseDto {
  id: number
  comboId: number
  currency: CurrencyCode
  unitPrice: number
  salePrice: number
  createdAt: string
  updatedAt: string
}

export interface CreateProductPricingDto {
  productId: number
  currency: CurrencyCode
  unitPrice: number
  salePrice: number
}

export interface CreateComboPricingDto {
  comboId: number
  currency: CurrencyCode
  unitPrice: number
  salePrice: number
}

export type UpdateProductPricingDto = Partial<Omit<CreateProductPricingDto, 'productId'>>
export type UpdateComboPricingDto = Partial<Omit<CreateComboPricingDto, 'comboId'>>

export interface CalculateProductDto {
  productId: number
}

export interface CalculateComboDto {
  comboId: number
}

export interface TaxPreviewInput {
  value: number
}

export interface CalculatePreviewDto {
  unitPrice: number
  salePrice: number
  discountValue?: number
  taxes?: TaxPreviewInput[]
  couponValue?: number
}

// Shape común de /pricing/calculate/product, /combo y /preview.
// En /product y /combo, `coupon` siempre es 0 y `orderTotal === finalPrice`
// (el cupón real se aplica al crear la orden, no acá — ver order.types.ts).
export interface PriceBreakdownDto {
  unitPrice: number
  salePrice: number
  margin: number
  discount: number
  priceAfterDiscount: number
  taxes: number
  finalPrice: number
  fullPrice: number
  coupon: number
  orderTotal: number
}
