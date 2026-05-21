# TypeScript Strict Patterns — Waiona Admin

Rules for writing type-safe code that matches the waiona-core API exactly. No `any`, no type assertions without justification.

---

## 1. API Response Types — One Source of Truth

All types live in `types/index.ts`. Never redeclare a type inline.

```typescript
// types/index.ts

// --- Shared infrastructure ---
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

export interface ApiErrorResponse {
  statusCode: number
  error: string
  message: string | string[]
  timestamp: string
  path: string
}

// --- Enums as const unions (not TypeScript enums) ---
export type RoleType = 'super_admin' | 'admin' | 'client'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'approved' | 'failed' | 'cancelled'
export type PaymentProvider = 'mercadopago'
export type DeliveryType = 'pickup' | 'delivery'
export type StockFlowType = 'inbound' | 'outbound'
export type StockOperationType = 'add' | 'remove'
export type StockWriteoffReason = 'damage' | 'expired' | 'loss'
export type StockLocationType = 'warehouse' | 'store' | 'other'
export type CouponDiscountType = 'PERCENTAGE' | 'FIXED'
export type DiscountStatus = 'active' | 'inactive'
export type ProductMeasurementUnit = 'unit' | 'kg' | 'liter' | 'gram' | 'ml'
```

Use **string unions** instead of TypeScript `enum` — they serialize correctly in JSON, are easier to type-check at boundaries, and don't generate runtime code.

---

## 2. Entity Types — Required vs Optional

Mark fields optional only when the API can omit them:

```typescript
// types/index.ts

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  isActive: boolean
  measurementUnit: ProductMeasurementUnit
  measurementValue: number
  categoryId: string
  category?: Category        // populated when API includes relation
  images?: ProductImage[]    // populated when API includes relation
  createdAt: string
  updatedAt: string
  deletedAt: string | null   // soft delete
}

// DTOs are separate from entities — never reuse the entity as a form type
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
```

---

## 3. Server Action State — Discriminated Union

```typescript
// Discriminated union for action states
export type ActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message?: string }

// Initial state is always idle
const initialState: ActionState = { status: 'idle' }

// Usage in component
const [state, formAction, isPending] = useActionState(createProduct, initialState)

// Type-safe reading
if (state.status === 'error') {
  // TypeScript knows state.message exists here
  return <p>{state.message}</p>
}
```

---

## 4. Generic API Client

```typescript
// lib/api.ts — fully typed
export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> { ... }

// Callers always specify the return type:
const products = await api.get<PaginatedResponse<Product>>('/products?page=1')
const product = await api.get<Product>(`/products/${id}`)
const created = await api.post<Product>('/products', dto)
```

Never call `api.get()` without a type parameter — the implicit `unknown` return makes subsequent code unsafe.

---

## 5. Type Guards for API Errors

```typescript
// lib/api.ts
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

// Usage in Server Actions — exhaustive error handling
export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await api.post<Product>('/products', dto)
    return { status: 'success' }
  } catch (err) {
    if (isApiError(err)) {
      if (err.status === 409) return { status: 'error', message: 'El SKU ya existe' }
      if (err.status === 400) return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error inesperado' }
  }
}
```

---

## 6. Typing params and searchParams

In Next.js 16, both `params` and `searchParams` are `Promise<{}>`:

```typescript
// Always await both
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>
}) {
  const { id } = await params
  const { page = '1', limit = '20', search } = await searchParams
  // ...
}
```

---

## 7. Utility Types for Forms

```typescript
// Partial DTO for edit forms — only changed fields are sent
type EditableProduct = Pick<UpdateProductDto, 'name' | 'description' | 'categoryId'>

// Extract enum keys for select options
function enumOptions<T extends string>(values: readonly T[]): { value: T; label: string }[] {
  return values.map((v) => ({ value: v, label: formatEnum(v) }))
}

const orderStatusOptions = enumOptions([
  'pending', 'confirmed', 'shipped', 'delivered', 'cancelled',
] as const satisfies OrderStatus[])
```

---

## 8. Nullability Conventions

- `string | null` — field exists in DB but can be null (e.g., `description`, `deletedAt`)
- `T | undefined` — field may not be included in the API response (optional relation)
- Never use `null | undefined` together — pick one per field and be consistent

```typescript
// Formatting nullable values safely
function formatNullable(value: string | null, fallback = '—'): string {
  return value ?? fallback
}
```

---

## 9. tsconfig.json — Strict Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

`noUncheckedIndexedAccess` forces null-checking on array access — catches bugs when `data[0]` could be undefined on empty paginated results.

---

## 10. Rules

- No `any` — use `unknown` and narrow with type guards.
- No `as Type` casting unless you've verified the shape at a system boundary.
- No TypeScript `enum` — use string union types.
- Every `api.get/post/patch/delete` call must have an explicit type parameter.
- DTOs are distinct from entity types — never pass an entity directly to a form.
- `ActionState` is a discriminated union — handle all branches explicitly.
