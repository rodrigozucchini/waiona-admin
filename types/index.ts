// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type RoleType = 'super_admin' | 'admin' | 'client'

export type CurrencyCode = 'ARS'
// USD existe en el enum del backend pero está comentado — no usar

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'

export type DeliveryType = 'delivery' | 'pickup'

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type PaymentProvider = 'mercadopago' | 'stripe'

export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'exhausted'

export type StockLocationType = 'WAREHOUSE' | 'STORE' | 'VIRTUAL'

export type StockOperationType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN' | 'INITIAL'

export type StockFlow = 'INBOUND' | 'OUTBOUND'

export type StockReferenceType = 'ORDER' | 'PURCHASE_ORDER' | 'ADJUSTMENT' | 'DAMAGE_REPORT' | 'MANUAL'

export type StockWriteoffReason = 'DAMAGED' | 'EXPIRED' | 'DEFECTIVE' | 'CONTAMINATED' | 'LOST' | 'INVENTORY_ERROR' | 'OTHER'

export type ProductMeasurementUnit = 'unit' | 'kg' | 'gram' | 'liter' | 'ml' | 'meter' | 'cm' | 'pack' | 'box' | 'dozen'

export type DiscountStatus = 'active' | 'scheduled' | 'expired'
// label calculado en el frontend — el backend NO lo devuelve en el DTO

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JWTPayload {
  sub: number
  role: RoleType
  iat: number
  exp: number
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: number
  name: string
  lastName: string
  avatar: string | null
}

export interface User {
  id: number
  email: string
  isActive: boolean
  role: RoleType | null
  profile: Profile
  createdAt: string
  updatedAt: string
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
  parentId: number | null
  createdAt: string
  updatedAt: string
}

export interface CategoryTree {
  id: number
  name: string
  children: CategoryTree[]
}

export interface CreateCategoryDto {
  name: string
  description?: string
  parentId?: number
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  parentId?: number
  isActive?: boolean
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: number
  productId: number
  url: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  sku: string
  name: string
  description: string
  isActive: boolean
  categoryId: number
  categoryName: string
  measurementUnit: ProductMeasurementUnit
  measurementValue?: number
  createdAt: string
  updatedAt: string
}

export interface CreateProductDto {
  sku: string
  name: string
  description: string
  categoryId: number
  measurementUnit: ProductMeasurementUnit
  measurementValue?: number
  isActive?: boolean
}

export interface UpdateProductDto {
  name?: string
  description?: string
  categoryId?: number
  measurementUnit?: ProductMeasurementUnit
  measurementValue?: number
  isActive?: boolean
}

// ─── Combos ───────────────────────────────────────────────────────────────────

export interface ComboImage {
  id: number
  comboId: number
  url: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface ComboItem {
  productId: number
  productName: string
  quantity: number
}

export interface Combo {
  id: number
  name: string
  description: string
  isActive: boolean
  categoryId: number
  categoryName: string
  items: ComboItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateComboDto {
  name: string
  description: string
  categoryId: number
  items: { productId: number; quantity: number }[]
  isActive?: boolean
}

export interface UpdateComboDto {
  name?: string
  description?: string
  categoryId?: number
  isActive?: boolean
  items?: { productId: number; quantity: number }[]
}

// ─── Stock ────────────────────────────────────────────────────────────────────

export interface StockLocation {
  id: number
  name: string
  type: StockLocationType
  address?: string
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: number
  stockItemId: number
  operationType: StockOperationType
  stockFlow: StockFlow
  quantity: number
  referenceType: StockReferenceType
  referenceId?: number
  createdAt: string
}

export interface StockItem {
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

export interface StockItemWithMovements extends StockItem {
  movements: StockMovement[]
}

export interface StockWriteOff {
  id: number
  stockItemId: number
  movementId: number
  quantity: number
  reason: StockWriteoffReason
  description?: string
  attachments?: string[]
  reportedBy: number
  createdAt: string
  updatedAt: string
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface Margin {
  id: number
  name: string
  value: number
  createdAt: string
  updatedAt: string
}

export interface ProductPricing {
  id: number
  productId: number
  currency: CurrencyCode
  unitPrice: number
  marginId?: number | null
  createdAt: string
  updatedAt: string
}

export interface ComboPricing {
  id: number
  comboId: number
  currency: CurrencyCode
  unitPrice: number
  marginId?: number | null
  createdAt: string
  updatedAt: string
}

export interface PriceBreakdown {
  unitPrice: number
  discount: number
  priceAfterDiscount: number
  margin: number
  priceAfterMargin: number
  taxes: number
  finalPrice: number
  fullPrice: number
  coupon: number
  orderTotal: number
}

// ─── Taxes ────────────────────────────────────────────────────────────────────

export interface TaxType {
  id: number
  code: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Tax {
  id: number
  code: string
  name: string
  value: number
  isGlobal: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductTax {
  id: number
  productId: number
  taxId: number
  tax?: Tax
  createdAt: string
  updatedAt: string
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export interface Discount {
  id: number
  name: string
  description?: string
  value: number
  createdAt: string
  updatedAt: string
}

export interface DiscountProductTarget {
  id: number
  discountId: number
  productId: number
  createdAt: string
  updatedAt: string
}

export interface DiscountComboTarget {
  id: number
  discountId: number
  comboId: number
  createdAt: string
  updatedAt: string
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export interface Coupon {
  id: number
  code: string
  status: CouponStatus
  value: number
  isGlobal: boolean
  usageLimit?: number
  usageCount: number
  startsAt?: string
  endsAt?: string
  createdAt: string
  updatedAt: string
}

export interface CouponProductTarget {
  id: number
  couponId: number
  productId: number
  createdAt: string
  updatedAt: string
}

export interface CouponComboTarget {
  id: number
  couponId: number
  comboId: number
  createdAt: string
  updatedAt: string
}

export interface CouponUsage {
  id: number
  couponId: number
  orderId: number
  userId: number
  appliedAt: string
  createdAt: string
  updatedAt: string
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: number
  productId: number | null
  productName: string | null
  comboId: number | null
  comboName: string | null
  quantity: number
  unitPrice: number
  finalPrice: number
}

export interface Order {
  id: number
  userId: number
  status: OrderStatus
  deliveryType: DeliveryType
  address: string | null
  notes: string | null
  subtotal: number
  couponDiscount: number | null
  couponCode: string | null
  total: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: number
  orderId: number
  provider: PaymentProvider
  status: PaymentStatus
  externalId?: string | null
  checkoutUrl?: string | null
  amount: number
  createdAt: string
  updatedAt: string
}

// ─── Shop ─────────────────────────────────────────────────────────────────────

export type StockStatus = 'available' | 'low' | 'critical' | 'out_of_stock'

export interface ShopItem {
  id: number
  name: string
  type: 'product' | 'combo'
  originalPrice: number
  finalPrice: number
  discountAmount: number
  hasDiscount: boolean
  inStock: boolean
  quantityAvailable: number
  category?: string
  image?: string
}

export interface ShopDetail {
  id: number
  name: string
  description?: string
  type: 'product' | 'combo'
  originalPrice: number
  finalPrice: number
  discountAmount: number
  priceAfterDiscount: number
  taxes: number
  hasDiscount: boolean
  inStock: boolean
  quantityAvailable: number
  stockStatus: StockStatus
  category?: string
  images: string[]
  items?: ComboItem[]
}

export interface ShopPaginatedResponse {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  data: ShopItem[]
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface OrderAnalytics {
  total: number
  byStatus: Record<OrderStatus, number>
  totalRevenue: number
  revenueToday: number
  revenueThisMonth: number
}

export interface TopProductItem {
  productId: number
  name: string
  sku: string
  totalSold: number
}

export interface CriticalStockItem {
  id: number
  productId: number
  productName: string
  sku: string
  locationId: number
  locationName: string
  quantityCurrent: number
  quantityReserved: number
  quantityAvailable: number
  stockCritical: number
  stockMin: number
}
