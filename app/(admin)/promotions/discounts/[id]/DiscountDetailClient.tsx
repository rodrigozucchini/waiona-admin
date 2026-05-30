'use client'

import { useActionState, useTransition, useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { Discount, DiscountProductTarget, DiscountComboTarget, Product, Combo } from '@/types'
import {
  updateDiscount,
  deleteDiscount,
  addDiscountProductTarget,
  removeDiscountProductTarget,
  addDiscountComboTarget,
  removeDiscountComboTarget,
} from '@/actions/promotions'

interface Props {
  discount: Discount
  productTargets: DiscountProductTarget[]
  comboTargets: DiscountComboTarget[]
  allProducts: Product[]
  allCombos: Combo[]
}

export function DiscountDetailClient({
  discount,
  productTargets,
  comboTargets,
  allProducts,
  allCombos,
}: Props) {
  const updateWithId = updateDiscount.bind(null, discount.id)
  const [updateState, updateAction, isUpdating] = useActionState(updateWithId, { status: 'idle' })
  const [isPending, startTransition] = useTransition()
  const [targetError, setTargetError] = useState<string | null>(null)

  useEffect(() => {
    if (updateState.status === 'success') toast.success('Descuento actualizado')
  }, [updateState.status])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedComboId, setSelectedComboId] = useState('')

  const targetProductIds = new Set(productTargets.map((t) => t.productId))
  const targetComboIds = new Set(comboTargets.map((t) => t.comboId))
  const availableProducts = allProducts.filter((p) => !targetProductIds.has(p.id))
  const availableCombos = allCombos.filter((c) => !targetComboIds.has(c.id))

  function run(fn: () => Promise<{ status: string; message?: string }>, successMsg = 'Guardado') {
    setTargetError(null)
    startTransition(async () => {
      const result = await fn()
      if (result.status === 'error') setTargetError(result.message ?? 'Error')
      else toast.success(successMsg)
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar el descuento "${discount.name}"?`)) return
    startTransition(async () => { await deleteDiscount(discount.id) })
  }

  const formatDateValue = (iso: string | null) => iso?.split('T')[0] ?? ''

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: edit form + delete */}
      <div className="space-y-4">
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-medium text-sm">Editar</h2>
          <form action={updateAction} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-medium">Nombre</label>
              <input
                id="name"
                name="name"
                defaultValue={discount.name}
                required
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="description" className="text-xs font-medium">Descripción</label>
              <input
                id="description"
                name="description"
                defaultValue={discount.description ?? ''}
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="value" className="text-xs font-medium">Porcentaje (0.01 – 100)</label>
              <div className="relative">
                <input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  defaultValue={discount.value}
                  required
                  className="w-full rounded-md border px-3 py-1.5 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="startsAt" className="text-xs font-medium">Inicia</label>
                <input
                  id="startsAt"
                  name="startsAt"
                  type="date"
                  defaultValue={formatDateValue(discount.startsAt)}
                  className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="endsAt" className="text-xs font-medium">Vence</label>
                <input
                  id="endsAt"
                  name="endsAt"
                  type="date"
                  defaultValue={formatDateValue(discount.endsAt)}
                  className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {updateState.status === 'error' && (
              <p role="alert" className="text-xs text-destructive">{updateState.message}</p>
            )}
            {updateState.status === 'success' && (
              <p className="text-xs text-green-600">Guardado.</p>
            )}
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {isUpdating ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-full rounded-md border border-destructive px-4 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {isPending ? 'Eliminando...' : 'Eliminar descuento'}
        </button>
      </div>

      {/* Right: targets */}
      <div className="lg:col-span-2 space-y-6">
        {targetError && <p className="text-sm text-destructive">{targetError}</p>}

        {/* Product targets */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-medium text-sm">
            Productos target
            <span className="ml-2 text-xs text-muted-foreground font-normal">(un producto solo puede tener un descuento a la vez)</span>
          </h2>
          {productTargets.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin productos asignados.</p>
          ) : (
            <ul className="space-y-1">
              {productTargets.map((t) => {
                const product = allProducts.find((p) => p.id === t.productId)
                return (
                  <li key={t.id} className="flex items-center justify-between text-sm">
                    <span>{product?.name ?? `Producto #${t.productId}`}</span>
                    <button
                      onClick={() => run(() => removeDiscountProductTarget(discount.id, t.productId))}
                      disabled={isPending}
                      className="text-xs text-destructive hover:underline disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {availableProducts.length > 0 && (
            <div className="flex gap-2 items-center border-t pt-3">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Agregar producto...</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!selectedProductId) return
                  run(() => addDiscountProductTarget(discount.id, Number(selectedProductId)))
                  setSelectedProductId('')
                }}
                disabled={isPending || !selectedProductId}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          )}
        </div>

        {/* Combo targets */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-medium text-sm">
            Combos target
            <span className="ml-2 text-xs text-muted-foreground font-normal">(un combo solo puede tener un descuento a la vez)</span>
          </h2>
          {comboTargets.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin combos asignados.</p>
          ) : (
            <ul className="space-y-1">
              {comboTargets.map((t) => {
                const combo = allCombos.find((c) => c.id === t.comboId)
                return (
                  <li key={t.id} className="flex items-center justify-between text-sm">
                    <span>{combo?.name ?? `Combo #${t.comboId}`}</span>
                    <button
                      onClick={() => run(() => removeDiscountComboTarget(discount.id, t.comboId))}
                      disabled={isPending}
                      className="text-xs text-destructive hover:underline disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {availableCombos.length > 0 && (
            <div className="flex gap-2 items-center border-t pt-3">
              <select
                value={selectedComboId}
                onChange={(e) => setSelectedComboId(e.target.value)}
                className="flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Agregar combo...</option>
                {availableCombos.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!selectedComboId) return
                  run(() => addDiscountComboTarget(discount.id, Number(selectedComboId)))
                  setSelectedComboId('')
                }}
                disabled={isPending || !selectedComboId}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
