# Promotions — Coupons & Discounts

Two distinct promotion types: **Coupons** (user-applied codes, tracked per use) and **Discounts** (automatic, applied by the system). Both support product/combo targets.

---

## 1. Domain Differences

| | Coupon | Discount |
|--|--------|----------|
| Applied by | User enters a code | System applies automatically |
| Tracking | `CouponUsage` per order | No usage tracking |
| Limits | `maxUses` (optional), `validFrom/validTo` | `validFrom/validTo` |
| Targets | Products and/or combos (empty = all) | Products and/or combos (empty = all) |
| Types | `PERCENTAGE` or `FIXED` amount | `PERCENTAGE` or `FIXED` amount |

---

## 2. Coupon Status Logic

Coupons don't have a stored `status` field — their active state is derived:

```typescript
function getCouponStatus(coupon: Coupon): 'active' | 'expired' | 'exhausted' | 'scheduled' {
  const now = new Date()
  const from = new Date(coupon.validFrom)
  const to = coupon.validTo ? new Date(coupon.validTo) : null

  if (coupon.maxUses !== null && coupon.usageCount >= coupon.maxUses) return 'exhausted'
  if (to && now > to) return 'expired'
  if (now < from) return 'scheduled'
  return 'active'
}
```

---

## 3. Server Actions — Coupons

```typescript
// actions/promotions.ts
'use server'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { api, ApiError } from '@/lib/api'

export async function createCoupon(_prev: unknown, formData: FormData) {
  const dto = {
    code: (formData.get('code') as string).toUpperCase().trim(),
    discountType: formData.get('discountType') as 'PERCENTAGE' | 'FIXED',
    discountValue: Number(formData.get('discountValue')),
    validFrom: formData.get('validFrom') as string,
    validTo: formData.get('validTo') || null,
    maxUses: formData.get('maxUses') ? Number(formData.get('maxUses')) : null,
  }

  if (!dto.code) return { error: 'El código es requerido' }
  if (dto.discountValue <= 0) return { error: 'El valor del descuento debe ser mayor a 0' }
  if (dto.discountType === 'PERCENTAGE' && dto.discountValue > 100) {
    return { error: 'El porcentaje no puede superar 100' }
  }

  try {
    const coupon = await api.post<{ id: string }>('/coupons', dto)
    revalidateTag('coupons')
    redirect(`/promotions/coupons/${coupon.id}`)
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al crear el cupón' }
  }
}

export async function assignProductsToCoupon(
  couponId: string,
  productIds: string[]
) {
  try {
    await api.post(`/coupons/${couponId}/targets/products`, { productIds })
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al asignar productos' }
  }
  revalidateTag('coupons')
  return null
}

export async function removeProductFromCoupon(couponId: string, productId: string) {
  try {
    await api.delete(`/coupons/${couponId}/targets/products/${productId}`)
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al remover producto' }
  }
  revalidateTag('coupons')
  return null
}
```

---

## 4. Coupon Detail Page

```typescript
// app/(admin)/promotions/coupons/[id]/page.tsx
import { api } from '@/lib/api'
import type { Coupon, PaginatedResponse, CouponUsage, Product } from '@/types'

export default async function CouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [coupon, usage, allProducts] = await Promise.all([
    api.get<Coupon>(`/coupons/${id}`),
    api.get<PaginatedResponse<CouponUsage>>(`/coupon-usage/coupon/${id}?limit=50`),
    api.get<PaginatedResponse<Product>>('/products?limit=100'),
  ])

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <CouponSummary coupon={coupon} />
        <CouponForm coupon={coupon} />
      </div>
      <div className="space-y-6">
        <TargetSelector
          couponId={id}
          allProducts={allProducts.data}
          currentTargets={coupon.targets?.products ?? []}
        />
        <CouponUsageTable usages={usage.data} />
      </div>
    </div>
  )
}
```

---

## 5. Target Selector Component

A product/combo picker that shows current targets and allows adding/removing:

```typescript
// components/promotions/TargetSelector.tsx
'use client'
import { useTransition } from 'react'
import { assignProductsToCoupon, removeProductFromCoupon } from '@/actions/promotions'

interface Props {
  couponId: string
  allProducts: Product[]
  currentTargets: { productId: string }[]
}

export function TargetSelector({ couponId, allProducts, currentTargets }: Props) {
  const [isPending, startTransition] = useTransition()
  const targetIds = new Set(currentTargets.map((t) => t.productId))

  function toggleProduct(productId: string) {
    startTransition(async () => {
      if (targetIds.has(productId)) {
        await removeProductFromCoupon(couponId, productId)
      } else {
        await assignProductsToCoupon(couponId, [productId])
      }
    })
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium">
        Productos target{' '}
        <span className="text-sm text-muted-foreground">
          (vacío = aplica a todo)
        </span>
      </h3>
      <div className={`space-y-1 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        {allProducts.map((product) => (
          <label key={product.id} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={targetIds.has(product.id)}
              onChange={() => toggleProduct(product.id)}
            />
            <span>{product.name}</span>
            <span className="text-xs text-muted-foreground">({product.sku})</span>
          </label>
        ))}
      </div>
    </div>
  )
}
```

---

## 6. Discounts

Discounts follow the same pattern as coupons but simpler (no usage tracking, no codes):

```typescript
// actions/promotions.ts
export async function createDiscount(_prev: unknown, formData: FormData) {
  const dto = {
    name: formData.get('name') as string,
    discountType: formData.get('discountType') as 'PERCENTAGE' | 'FIXED',
    discountValue: Number(formData.get('discountValue')),
    validFrom: formData.get('validFrom') as string,
    validTo: formData.get('validTo') || null,
    status: 'active',
  }

  try {
    const discount = await api.post<{ id: string }>('/discounts', dto)
    revalidateTag('discounts')
    redirect(`/promotions/discounts/${discount.id}`)
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al crear el descuento' }
  }
}
```

---

## 7. Date Range Inputs

Both promotions use date ranges. Use native `<input type="date">` and convert to ISO strings:

```typescript
// In the form:
<input
  name="validFrom"
  type="date"
  defaultValue={coupon?.validFrom?.split('T')[0]}
  required
/>
<input
  name="validTo"
  type="date"
  defaultValue={coupon?.validTo?.split('T')[0]}
  min={validFrom} // prevent end before start
/>
```

---

## 8. Rules

- Coupon codes are always stored and displayed uppercase — call `.toUpperCase().trim()` in the action.
- Empty `targets` array = coupon/discount applies to all products/combos. Show this clearly in the UI.
- A `409` on coupon creation means the code already exists — show "Código en uso".
- Never delete a coupon that has usage records. Instead, set `validTo` to a past date to deactivate it.
- `maxUses: null` means unlimited uses — display as "Sin límite" in the UI.
- Discount `status` field is `active | inactive` — provide a toggle to deactivate without deleting.
