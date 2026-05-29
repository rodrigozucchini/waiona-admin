'use client'

import { useActionState, useState } from 'react'
import type { Combo, Category, Product, ComboItem } from '@/types'
import type { ComboActionState } from '@/actions/combos'

interface Props {
  action: (prev: ComboActionState, formData: FormData) => Promise<ComboActionState>
  combo?: Combo
  categories: Category[]
  products: Product[]
}

export function ComboForm({ action, combo, categories, products }: Props) {
  const [state, formAction, isPending] = useActionState(action, { status: 'idle' })
  const [items, setItems] = useState<ComboItem[]>(combo?.items ?? [])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  function addItem() {
    if (!selectedProductId) return
    const productId = Number(selectedProductId)
    const existing = items.findIndex((i) => i.productId === productId)
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (existing >= 0) {
      setItems(items.map((item, idx) =>
        idx === existing
          ? { ...item, quantity: item.quantity + selectedQuantity }
          : item
      ))
    } else {
      setItems([...items, { productId, productName: product.name, quantity: selectedQuantity }])
    }
    setSelectedProductId('')
    setSelectedQuantity(1)
  }

  function removeItem(productId: number) {
    setItems(items.filter((i) => i.productId !== productId))
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) return removeItem(productId)
    setItems(items.map((i) => i.productId === productId ? { ...i, quantity } : i))
  }

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <input type="hidden" name="items" value={JSON.stringify(items.map(({ productId, quantity }) => ({ productId, quantity })))} />

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          name="name"
          defaultValue={combo?.name}
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción <span className="text-destructive">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={combo?.description ?? ''}
          rows={3}
          required
          minLength={5}
          maxLength={255}
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
          defaultValue={combo?.categoryId ?? ''}
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {combo && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Estado</label>
          <select
            name="isActive"
            defaultValue={combo.isActive ? 'true' : 'false'}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">
          Productos del combo <span className="text-destructive">*</span>
        </p>

        {items.length > 0 && (
          <ul className="divide-y rounded-md border">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="flex-1 font-medium">{item.productName}</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                  className="w-16 rounded border px-2 py-1 text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-destructive hover:underline text-xs"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Agregar producto...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(Number(e.target.value))}
            className="w-16 rounded-md border px-3 py-2 text-center text-sm"
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!selectedProductId}
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-40"
          >
            Agregar
          </button>
        </div>
      </div>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-destructive">{state.message}</p>
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
          {isPending ? 'Guardando...' : combo ? 'Guardar cambios' : 'Crear combo'}
        </button>
        <a href="/catalog/combos" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
          Cancelar
        </a>
      </div>
    </form>
  )
}
