'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Product, StockLocation } from '@/types'
import { createStockItem } from '@/actions/stock'

interface Props {
  products: Product[]
  locations: StockLocation[]
}

export function NewStockItemForm({ products, locations }: Props) {
  const [state, action, isPending] = useActionState(createStockItem, { status: 'idle' })

  useEffect(() => {
    if (state.status === 'success') toast.success('Ítem de stock creado')
  }, [state.status])

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="productId" className="text-sm font-medium">
          Producto <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <select
          id="productId"
          name="productId"
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccioná un producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.sku}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="locationId" className="text-sm font-medium">
          Ubicación <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <select
          id="locationId"
          name="locationId"
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccioná una ubicación</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="stockMin" className="text-sm font-medium">Stock mínimo</label>
          <input
            id="stockMin"
            name="stockMin"
            type="number"
            min="1"
            defaultValue="10"
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Alerta de stock bajo (≥ 1)</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="stockCritical" className="text-sm font-medium">Stock crítico</label>
          <input
            id="stockCritical"
            name="stockCritical"
            type="number"
            min="0"
            defaultValue="3"
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Alerta urgente ({'<'} mínimo)</p>
        </div>
      </div>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Creando...' : 'Crear ítem de stock'}
        </button>
        <Link href="/stock/items" className="rounded-md border px-4 py-2 text-sm hover:bg-muted">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
