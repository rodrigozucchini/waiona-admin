# Pricing & Taxes — Configuration Module

Pricing in waiona is calculated server-side: the admin sets `baseCost`, `basePrice`, and a `Margin` (percentage). The API computes `finalPrice`. Taxes are assigned separately as rates on top.

---

## 1. Data Model

```
Margin
  name: string
  percentage: number  (0-100)

ProductPricing
  productId
  currencyCode       (ARS, USD, etc.)
  baseCost           (cost to acquire)
  basePrice          (selling price before margin)
  marginId           → Margin
  finalPrice         (calculated by API: basePrice * (1 + margin.percentage / 100))

TaxType
  code               (unique identifier, e.g. "IVA", "IIBB")
  name
  description

Tax
  taxTypeId          → TaxType
  rate               (percentage, e.g. 21)
  description

ProductTax
  productId
  taxId              → Tax
  appliedRate        (rate at time of assignment)
```

---

## 2. Margins CRUD

```typescript
// actions/pricing.ts
'use server'
import { revalidateTag } from 'next/cache'
import { api, ApiError } from '@/lib/api'

export async function createMargin(_prev: unknown, formData: FormData) {
  const name = formData.get('name') as string
  const percentage = Number(formData.get('percentage'))

  if (!name) return { error: 'Nombre requerido' }
  if (percentage < 0 || percentage > 100) return { error: 'Porcentaje inválido (0-100)' }

  try {
    await api.post('/margins', { name, percentage })
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al crear el margen' }
  }

  revalidateTag('pricing')
  return null
}

export async function deleteMargin(id: string) {
  try {
    await api.delete(`/margins/${id}`)
  } catch (err) {
    if (err instanceof ApiError) {
      // 409 = margin is in use by pricing records
      return { error: err.message }
    }
    return { error: 'Error al eliminar' }
  }
  revalidateTag('pricing')
  return null
}
```

---

## 3. Product Pricing Page

Show all products with their pricing per currency. Group by product, list all currency rows.

```typescript
// app/(admin)/pricing/products/page.tsx
import { api } from '@/lib/api'
import type { PaginatedResponse, ProductPricing, Product, Margin } from '@/types'

export default async function ProductPricingPage() {
  const [pricings, margins] = await Promise.all([
    api.get<PaginatedResponse<ProductPricing>>('/product-pricing?limit=100'),
    api.get<PaginatedResponse<Margin>>('/margins?limit=100'),
  ])

  return (
    <div>
      <h1>Precios de Productos</h1>
      <ProductPricingTable
        pricings={pricings.data}
        margins={margins.data}
      />
    </div>
  )
}
```

---

## 4. Pricing Form with Live Preview

Show the calculated `finalPrice` using the preview endpoint before saving:

```typescript
// components/forms/PricingForm.tsx
'use client'
import { useActionState, useState } from 'react'
import { createProductPricing } from '@/actions/pricing'

interface Props {
  productId: string
  margins: Margin[]
}

export function PricingForm({ productId, margins }: Props) {
  const [preview, setPreview] = useState<number | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const action = createProductPricing.bind(null, productId)
  const [state, formAction, isPending] = useActionState(action, null)

  async function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget)
    const basePrice = Number(data.get('basePrice'))
    const marginId = data.get('marginId') as string

    if (!basePrice || !marginId) return

    setIsPreviewLoading(true)
    try {
      const res = await fetch('/api/pricing/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'product', productId, basePrice, marginId }),
      })
      const result = await res.json()
      setPreview(result.finalPrice)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  return (
    <form action={formAction} onChange={handlePreview} className="space-y-4">
      <input name="productId" type="hidden" value={productId} />

      <div>
        <label>Moneda</label>
        <select name="currencyCode">
          <option value="ARS">ARS</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div>
        <label>Costo base</label>
        <input name="baseCost" type="number" step="0.01" min="0" required />
      </div>

      <div>
        <label>Precio base</label>
        <input name="basePrice" type="number" step="0.01" min="0" required />
      </div>

      <div>
        <label>Margen</label>
        <select name="marginId" required>
          <option value="">Sin margen</option>
          {margins.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.percentage}%)
            </option>
          ))}
        </select>
      </div>

      {preview !== null && (
        <div className="rounded bg-muted p-3">
          <p className="text-sm text-muted-foreground">Precio final estimado:</p>
          <p className="text-xl font-bold">${preview.toFixed(2)}</p>
          {isPreviewLoading && <p className="text-xs">Calculando...</p>}
        </div>
      )}

      {state?.error && <p className="text-destructive">{state.error}</p>}

      <button disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar precio'}
      </button>
    </form>
  )
}
```

---

## 5. Tax Assignment

Taxes are assigned to products via nested routes. Show current taxes and an add form side by side:

```typescript
// app/(admin)/taxes/[typeId]/page.tsx
import { api } from '@/lib/api'
import type { TaxType, PaginatedResponse, Tax } from '@/types'

export default async function TaxTypePage({
  params,
}: {
  params: Promise<{ typeId: string }>
}) {
  const { typeId } = await params

  const [taxType, taxes] = await Promise.all([
    api.get<TaxType>(`/tax-types/${typeId}`),
    api.get<PaginatedResponse<Tax>>(`/tax-types/${typeId}/taxes?limit=100`),
  ])

  return (
    <div>
      <h1>{taxType.name}</h1>
      <TaxList taxes={taxes.data} taxTypeId={typeId} />
      <TaxForm taxTypeId={typeId} />
    </div>
  )
}
```

```typescript
// actions/taxes.ts
'use server'
import { revalidateTag } from 'next/cache'
import { api, ApiError } from '@/lib/api'

export async function assignTaxToProduct(
  productId: string,
  _prev: unknown,
  formData: FormData
) {
  const taxId = formData.get('taxId') as string
  const appliedRate = Number(formData.get('appliedRate'))

  try {
    await api.post(`/products/${productId}/taxes`, { taxId, appliedRate })
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al asignar impuesto' }
  }

  revalidateTag('pricing')
  return null
}

export async function removeTaxFromProduct(productId: string, taxAssignmentId: string) {
  try {
    await api.delete(`/products/${productId}/taxes/${taxAssignmentId}`)
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al remover impuesto' }
  }
  revalidateTag('pricing')
  return null
}
```

---

## 6. Rules

- A margin with `percentage=0` is valid — it means no markup.
- The API computes `finalPrice` — never compute it in the frontend.
- Use the `POST /pricing/calculate/preview` endpoint to show live price previews in forms.
- A `409` when deleting a margin means it's in use — show the error message from the API.
- `appliedRate` in ProductTax is the rate locked at time of assignment (not always equal to Tax.rate, which can change).
- Tax assignment is per product/combo, not per pricing entry — taxes apply at the product level regardless of currency.
