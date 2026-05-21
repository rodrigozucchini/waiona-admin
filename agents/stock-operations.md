# Stock Operations — Inventory Management

The stock module is the most operationally complex part of the admin. Stock items have strict lifecycle transitions and every mutation creates an immutable audit record.

---

## 1. Domain Model

```
StockItem
  productId       → which product
  locationId      → where it is stored
  quantity        → total physical units
  reserved        → units dispatched to orders (locked)
  criticalThreshold / warningThreshold

available = quantity - reserved
```

**Derived states:**
- `available > warningThreshold` → healthy
- `available <= warningThreshold` → warning (yellow)
- `available <= criticalThreshold` → critical (red)

---

## 2. Operations

| Operation | Endpoint | Effect | Reversible? |
|-----------|----------|--------|------------|
| Add stock | `POST /stock-items/add-stock` | `quantity += n` | Via write-off |
| Write-off | `POST /stock-items/write-off` | `quantity -= n` (loss/expired) | No |
| Write-off damage | `POST /stock-items/write-off-damage` | `quantity -= n, reserved -= n` | No |
| Dispatch | `POST /stock-items/dispatch` | `reserved += n` | Via release |
| Release | `POST /stock-items/release` | `reserved -= n` | — |
| Set thresholds | `PATCH /stock-items/:id/thresholds` | Updates critical/warning | Yes |

---

## 3. Server Actions

```typescript
// actions/stock.ts
'use server'
import { revalidateTag } from 'next/cache'
import { api, ApiError } from '@/lib/api'

type StockActionState = { error?: string } | null

export async function addStock(
  stockItemId: string,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const quantity = Number(formData.get('quantity'))
  const notes = formData.get('notes') as string

  if (!quantity || quantity <= 0) {
    return { error: 'La cantidad debe ser mayor a 0' }
  }

  try {
    await api.post('/stock-items/add-stock', { stockItemId, quantity, notes })
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al agregar stock' }
  }

  revalidateTag('stock')
  return null
}

export async function writeOffStock(
  stockItemId: string,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const quantity = Number(formData.get('quantity'))
  const reason = formData.get('reason') as 'damage' | 'expired' | 'loss'
  const notes = formData.get('notes') as string

  if (!quantity || quantity <= 0) return { error: 'Cantidad inválida' }
  if (!reason) return { error: 'Razón requerida' }

  try {
    await api.post('/stock-items/write-off', { stockItemId, quantity, reason, notes })
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al dar de baja el stock' }
  }

  revalidateTag('stock')
  return null
}

export async function updateThresholds(
  stockItemId: string,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const criticalThreshold = Number(formData.get('criticalThreshold'))
  const warningThreshold = Number(formData.get('warningThreshold'))

  if (criticalThreshold >= warningThreshold) {
    return { error: 'El umbral crítico debe ser menor al de advertencia' }
  }

  try {
    await api.patch(`/stock-items/${stockItemId}/thresholds`, {
      criticalThreshold,
      warningThreshold,
    })
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al actualizar umbrales' }
  }

  revalidateTag('stock')
  return null
}
```

---

## 4. Stock Item Detail Page

The detail page shows current stock, thresholds, movement history, and operation panel:

```typescript
// app/(admin)/stock/items/[id]/page.tsx
import { api } from '@/lib/api'
import { StockOperationPanel } from '@/components/stock/StockOperationPanel'
import type { StockItem, PaginatedResponse, StockMovement } from '@/types'

export default async function StockItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [item, movements] = await Promise.all([
    api.get<StockItem>(`/stock-items/${id}`),
    api.get<PaginatedResponse<StockMovement>>(
      `/stock-movements/stock-item/${id}?page=1&limit=50`
    ),
  ])

  const available = item.quantity - item.reserved

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Stock summary */}
      <div className="col-span-1 space-y-4">
        <StockSummaryCard item={item} available={available} />
        <StockOperationPanel stockItemId={id} available={available} />
      </div>

      {/* Movement history */}
      <div className="col-span-2">
        <MovementHistory movements={movements.data} />
      </div>
    </div>
  )
}
```

---

## 5. Stock Operation Panel

Destructive operations (write-off) require explicit confirmation:

```typescript
// components/stock/StockOperationPanel.tsx
'use client'
import { useActionState, useState } from 'react'
import { addStock, writeOffStock } from '@/actions/stock'

type Operation = 'add' | 'writeoff' | null

interface Props {
  stockItemId: string
  available: number
}

export function StockOperationPanel({ stockItemId, available }: Props) {
  const [operation, setOperation] = useState<Operation>(null)

  const addAction = addStock.bind(null, stockItemId)
  const writeOffAction = writeOffStock.bind(null, stockItemId)

  const [addState, addFormAction, isAddPending] = useActionState(addAction, null)
  const [writeOffState, writeOffFormAction, isWriteOffPending] = useActionState(
    writeOffAction,
    null
  )

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-medium">Operaciones</h3>

      <div className="flex gap-2">
        <button onClick={() => setOperation('add')}>Agregar stock</button>
        <button
          onClick={() => setOperation('writeoff')}
          className="text-destructive"
        >
          Dar de baja
        </button>
      </div>

      {operation === 'add' && (
        <form action={addFormAction} className="space-y-3">
          <input
            name="quantity"
            type="number"
            min="1"
            placeholder="Cantidad"
            required
          />
          <input name="notes" placeholder="Notas (opcional)" />
          {addState?.error && <p className="text-destructive">{addState.error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isAddPending}>
              {isAddPending ? 'Procesando...' : 'Confirmar'}
            </button>
            <button type="button" onClick={() => setOperation(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {operation === 'writeoff' && (
        <form action={writeOffFormAction} className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Stock disponible: <strong>{available}</strong> unidades
          </p>
          <input
            name="quantity"
            type="number"
            min="1"
            max={available}
            placeholder="Cantidad a dar de baja"
            required
          />
          <select name="reason" required>
            <option value="">Seleccionar razón</option>
            <option value="damage">Daño</option>
            <option value="expired">Vencimiento</option>
            <option value="loss">Pérdida</option>
          </select>
          <textarea name="notes" placeholder="Notas" />
          {writeOffState?.error && (
            <p className="text-destructive">{writeOffState.error}</p>
          )}
          <p className="rounded bg-destructive/10 p-2 text-sm text-destructive">
            ⚠ Esta operación no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isWriteOffPending}
              className="bg-destructive text-white"
            >
              {isWriteOffPending ? 'Procesando...' : 'Confirmar baja'}
            </button>
            <button type="button" onClick={() => setOperation(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
```

---

## 6. Stock Status Badge

```typescript
// components/stock/StockStatusBadge.tsx
interface Props {
  available: number
  criticalThreshold: number
  warningThreshold: number
}

export function StockStatusBadge({
  available,
  criticalThreshold,
  warningThreshold,
}: Props) {
  if (available <= criticalThreshold) {
    return <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">Crítico</span>
  }
  if (available <= warningThreshold) {
    return <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700">Advertencia</span>
  }
  return <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Normal</span>
}
```

---

## 7. Rules

- Write-off and write-off-damage are **irreversible** — always show a warning before confirming.
- Never let users write off more than `available` units — validate client-side (max attribute) and handle API 400.
- Dispatch/release is managed by the orders flow, not directly from the stock UI.
- Movement history is read-only — no mutations from the movements table.
- `criticalThreshold` must always be `< warningThreshold` — validate before submitting.
- Show `available = quantity - reserved` prominently, not just `quantity`.
