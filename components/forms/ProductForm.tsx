'use client'

import { useActionState } from 'react'
import type { Product, Category } from '@/types'
import type { ProductActionState } from '@/actions/products'

const MEASUREMENT_UNITS = [
  { value: 'unit', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'liter', label: 'Litro' },
  { value: 'gram', label: 'Gramo' },
  { value: 'ml', label: 'Mililitro' },
]

interface Props {
  action: (prev: ProductActionState, formData: FormData) => Promise<ProductActionState>
  product?: Product
  categories: Category[]
}

export function ProductForm({ action, product, categories }: Props) {
  const [state, formAction, isPending] = useActionState(action, { status: 'idle' })

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <div className="space-y-1">
        <label htmlFor="sku" className="text-sm font-medium">
          SKU <span className="text-destructive">*</span>
        </label>
        <input
          id="sku"
          name="sku"
          defaultValue={product?.sku}
          required
          disabled={!!product}
          placeholder="PROD-001"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
        />
        {product && (
          <p className="text-xs text-muted-foreground">El SKU no puede modificarse.</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          name="name"
          defaultValue={product?.name}
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ''}
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="categoryId" className="text-sm font-medium">
          Categoría <span className="text-destructive">*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={product?.categoryId ?? ''}
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="measurementUnit" className="text-sm font-medium">
            Unidad de medida <span className="text-destructive">*</span>
          </label>
          <select
            id="measurementUnit"
            name="measurementUnit"
            defaultValue={product?.measurementUnit ?? 'unit'}
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {MEASUREMENT_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="measurementValue" className="text-sm font-medium">
            Valor de medida
          </label>
          <input
            id="measurementValue"
            name="measurementValue"
            type="number"
            step="0.001"
            min="0"
            defaultValue={product?.measurementValue ?? ''}
            placeholder="Ej: 1.5"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {product && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Estado</label>
          <select
            name="isActive"
            defaultValue={product.isActive ? 'true' : 'false'}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      )}

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      {state.status === 'success' && (
        <p className="text-sm text-green-600">Cambios guardados.</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <a
          href="/catalog/products"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
