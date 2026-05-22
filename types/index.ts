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
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  parent?: Category
  children?: Category[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  name: string
  description?: string
  parentId?: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  parentId?: string
  isActive?: boolean
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  altText: string
  position: number
  createdAt: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  isActive: boolean
  measurementUnit: ProductMeasurementUnit
  measurementValue: number
  categoryId: string
  category?: Category
  images?: ProductImage[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateProductDto {
  sku: string
  name: string
  description?: string
  categoryId: string
  measurementUnit: ProductMeasurementUnit
  measurementValue: number
}

export interface UpdateProductDto {
  name?: string
  description?: string
  categoryId?: string
  measurementUnit?: ProductMeasurementUnit
  measurementValue?: number
  isActive?: boolean
}

// ─── Combos ───────────────────────────────────────────────────────────────────

export interface ComboImage {
  id: string
  comboId: string
  imageUrl: string
  altText: string
  position: number
  createdAt: string
}

export interface ComboItem {
  id: string
  comboId: string
  productId: string
  product?: Product
  quantity: number
}

export interface Combo {
  id: string
  name: string
  description: string | null
  isActive: boolean
  items?: ComboItem[]
  images?: ComboImage[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateComboDto {
  name: string
  description?: string
  items: { productId: string; quantity: number }[]
}

export interface UpdateComboDto {
  name?: string
  description?: string
  isActive?: boolean
}

// ─── Stock ────────────────────────────────────────────────────────────────────

export interface StockLocation {
  id: string
  name: string
  type: StockLocationType
  address: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StockItem {
  id: string
  productId: string
  product?: Product
  locationId: string
  location?: StockLocation
  quantity: number
  reserved: number
  criticalThreshold: number
  warningThreshold: number
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  stockItemId: string
  stockItem?: StockItem
  flowType: StockFlowType
  operationType: StockOperationType
  quantity: number
  notes: string | null
  createdAt: string
}

export interface StockWriteOff {
  id: string
  stockItemId: string
  stockItem?: StockItem
  quantity: number
  reason: StockWriteoffReason
  notes: string | null
  createdAt: string
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface Margin {
  id: string
  name: string
  percentage: number
  createdAt: string
  updatedAt: string
}

export interface ProductPricing {
  id: string
  productId: string
  product?: Product
  currencyCode: CurrencyCode
  baseCost: number
  basePrice: number
  marginId: string | null
  margin?: Margin
  finalPrice: number
  createdAt: string
  updatedAt: string
}

export interface ComboPricing {
  id: string
  comboId: string
  combo?: Combo
  currencyCode: CurrencyCode
  baseCost: number
  basePrice: number
  marginId: string | null
  margin?: Margin
  finalPrice: number
  createdAt: string
  updatedAt: string
}

// ─── Taxes ────────────────────────────────────────────────────────────────────

export interface TaxType {
  id: string
  code: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Tax {
  id: string
  taxTypeId: string
  taxType?: TaxType
  rate: number
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductTax {
  id: string
  productId: string
  taxId: string
  tax?: Tax
  appliedRate: number
  createdAt: string
}

// ─── Promotions ───────────────────────────────────────────────────────────────

export interface CouponUsage {
  id: string
  couponId: string
  orderId: string
  userId: string
  usedAt: string
}

export interface Coupon {
  id: string
  code: string
  discountType: CouponDiscountType
  discountValue: number
  validFrom: string
  validTo: string | null
  maxUses: number | null
  usageCount: number
  targets?: {
    products: { productId: string; product?: Product }[]
    combos: { comboId: string; combo?: Combo }[]
  }
  createdAt: string
  updatedAt: string
}

export interface Discount {
  id: string
  name: string
  discountType: CouponDiscountType
  discountValue: number
  validFrom: string
  validTo: string | null
  status: DiscountStatus
  targets?: {
    products: { productId: string; product?: Product }[]
    combos: { comboId: string; combo?: Combo }[]
  }
  createdAt: string
  updatedAt: string
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  comboId: string | null
  product?: Product
  combo?: Combo
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Payment {
  id: string
  orderId: string
  provider: PaymentProvider
  status: PaymentStatus
  amount: number
  currencyCode: CurrencyCode
  externalId: string | null
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
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
  productId: string
  productName: string
  totalSold: number
  totalRevenue: number
}

export interface CriticalStockItem {
  stockItemId: string
  productName: string
  locationName: string
  available: number
  criticalThreshold: number
}
