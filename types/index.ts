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

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'

export type PaymentStatus = 'pending' | 'approved' | 'failed' | 'cancelled'

export type PaymentProvider = 'mercadopago'

export type DeliveryType = 'pickup' | 'delivery'

export type StockFlowType = 'inbound' | 'outbound'

export type StockOperationType = 'add' | 'remove'

export type StockWriteoffReason = 'damage' | 'expired' | 'loss'

export type StockLocationType = 'warehouse' | 'store' | 'other'

export type CurrencyCode = 'ARS' | 'USD'

export type ProductMeasurementUnit = 'unit' | 'kg' | 'liter' | 'gram' | 'ml'

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED'

export type DiscountStatus = 'active' | 'inactive'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

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
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface UserRole {
  id: number
  type: RoleType
}

export interface User {
  id: number
  email: string
  isActive: boolean
  profile: Profile | null
  role: UserRole | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  description: string | null
  parentId: number | null
  children?: Category[]
  isActive: boolean
  createdAt: string
  updatedAt: string
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
  altText: string
  position: number
  createdAt: string
}

export interface Product {
  id: number
  sku: string
  name: string
  description: string | null
  isActive: boolean
  measurementUnit: ProductMeasurementUnit
  measurementValue: number | null
  categoryId: number
  categoryName: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateProductDto {
  sku: string
  name: string
  description?: string
  categoryId: number
  measurementUnit: ProductMeasurementUnit
  measurementValue?: number
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
  altText: string
  position: number
  createdAt: string
}

export interface ComboItem {
  productId: number
  productName: string
  quantity: number
}

export interface Combo {
  id: number
  name: string
  description: string | null
  isActive: boolean
  categoryId: number | null
  categoryName: string | null
  items?: ComboItem[]
  images?: ComboImage[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateComboDto {
  name: string
  description?: string
  categoryId?: number
  items: { productId: number; quantity: number }[]
}

export interface UpdateComboDto {
  name?: string
  description?: string
  categoryId?: number
  isActive?: boolean
}

// ─── Stock ────────────────────────────────────────────────────────────────────

export interface StockLocation {
  id: number
  name: string
  type: StockLocationType
  address: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StockItem {
  id: number
  productId: number
  product?: Product
  locationId: number
  location?: StockLocation
  quantity: number
  reserved: number
  criticalThreshold: number
  warningThreshold: number
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: number
  stockItemId: number
  stockItem?: StockItem
  flowType: StockFlowType
  operationType: StockOperationType
  quantity: number
  notes: string | null
  createdAt: string
}

export interface StockWriteOff {
  id: number
  stockItemId: number
  stockItem?: StockItem
  quantity: number
  reason: StockWriteoffReason
  notes: string | null
  createdAt: string
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface Margin {
  id: number
  name: string
  percentage: number
  createdAt: string
  updatedAt: string
}

export interface ProductPricing {
  id: number
  productId: number
  product?: Product
  currencyCode: CurrencyCode
  baseCost: number
  basePrice: number
  marginId: number | null
  margin?: Margin
  finalPrice: number
  createdAt: string
  updatedAt: string
}

export interface ComboPricing {
  id: number
  comboId: number
  combo?: Combo
  currencyCode: CurrencyCode
  baseCost: number
  basePrice: number
  marginId: number | null
  margin?: Margin
  finalPrice: number
  createdAt: string
  updatedAt: string
}

// ─── Taxes ────────────────────────────────────────────────────────────────────

export interface TaxType {
  id: number
  code: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Tax {
  id: number
  taxTypeId: number
  taxType?: TaxType
  rate: number
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductTax {
  id: number
  productId: number
  taxId: number
  tax?: Tax
  appliedRate: number
  createdAt: string
}

// ─── Promotions ───────────────────────────────────────────────────────────────

export interface CouponUsage {
  id: number
  couponId: number
  orderId: number
  userId: number
  usedAt: string
}

export interface Coupon {
  id: number
  code: string
  discountType: CouponDiscountType
  discountValue: number
  validFrom: string
  validTo: string | null
  maxUses: number | null
  usageCount: number
  targets?: {
    products: { productId: number; product?: Product }[]
    combos: { comboId: number; combo?: Combo }[]
  }
  createdAt: string
  updatedAt: string
}

export interface Discount {
  id: number
  name: string
  discountType: CouponDiscountType
  discountValue: number
  validFrom: string
  validTo: string | null
  status: DiscountStatus
  targets?: {
    products: { productId: number; product?: Product }[]
    combos: { comboId: number; combo?: Combo }[]
  }
  createdAt: string
  updatedAt: string
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: number
  orderId: number
  productId: number | null
  comboId: number | null
  product?: Product
  combo?: Combo
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Payment {
  id: number
  orderId: number
  provider: PaymentProvider
  status: PaymentStatus
  amount: number
  currencyCode: CurrencyCode
  externalId: string | null
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: number
  userId: number
  user?: User
  status: OrderStatus
  deliveryType: DeliveryType
  total: number
  currencyCode: CurrencyCode
  items?: OrderItem[]
  payments?: Payment[]
  createdAt: string
  updatedAt: string
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
  productName: string
  totalSold: number
  totalRevenue: number
}

export interface CriticalStockItem {
  stockItemId: number
  productName: string
  locationName: string
  available: number
  criticalThreshold: number
}
