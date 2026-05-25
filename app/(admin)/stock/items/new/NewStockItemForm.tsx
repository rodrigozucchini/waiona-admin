'use client'
import { useActionState } from 'react'
import { createStockItem } from '@/actions/stock'
import type { Product, StockLocation } from '@/types'

interface Props {
  products: Product[]
  locations: StockLocation[]
}

export function NewStockItemForm({ products, locations }: Props) {
  const [state, formAction, isPending] = useActionState(createStockItem, { status: 'idle' })

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="productId" className="text-sm font-medium">
          Producto <span className="text-destructive">*</span>
        </label>
        <select
          id="productId"
          name="productId"
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Seleccionar producto...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="locationId" className="text-sm font-medium">
          Ubicación <span className="text-destructive">*</span>
        </label>
        <select
          id="locationId"
          name="locationId"
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Seleccionar ubicación...</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.type})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label htmlFor="stockCritical" className="text-sm font-medium">
            Umbral crítico <span className="text-destructive">*</span>
          </label>
          <input
            id="stockCritical"
            name="stockCritical"
            type="number"
            min="0"
            defaultValue="5"
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="stockMin" className="text-sm font-medium">
            Mínimo <span className="text-destructive">*</span>
          </label>
          <input
            id="stockMin"
            name="stockMin"
            type="number"
            min="0"
            defaultValue="10"
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="stockMax" className="text-sm font-medium">
            Máximo
          </label>
          <input
            id="stockMax"
            name="stockMax"
            type="number"
            min="0"
            placeholder="Sin límite"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Crítico &lt; Mínimo &lt; Máximo. El stock inicial es 0 — usá "Agregar stock" desde el detalle.
      </p>

      {state.status === 'error' && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Creando...' : 'Crear ítem de stock'}
        </button>
        <a
          href="/stock/items"
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
