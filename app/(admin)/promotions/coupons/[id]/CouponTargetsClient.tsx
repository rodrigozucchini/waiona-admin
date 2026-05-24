'use client'

import { useTransition, useState } from 'react'
import type { CouponProductTarget, CouponComboTarget, Product, Combo } from '@/types'
import {
  addCouponProductTarget,
  removeCouponProductTarget,
  addCouponComboTarget,
  removeCouponComboTarget,
  deleteCoupon,
} from '@/actions/promotions'

interface Props {
  couponId: number
  productTargets: CouponProductTarget[]
  comboTargets: CouponComboTarget[]
  allProducts: Product[]
  allCombos: Combo[]
}

export function CouponTargetsClient({
  couponId,
  productTargets,
  comboTargets,
  allProducts,
  allCombos,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedComboId, setSelectedComboId] = useState('')

  const targetProductIds = new Set(productTargets.map((t) => t.productId))
  const targetComboIds = new Set(comboTargets.map((t) => t.comboId))

  const availableProducts = allProducts.filter((p) => !targetProductIds.has(p.id))
  const availableCombos = allCombos.filter((c) => !targetComboIds.has(c.id))

  function run(fn: () => Promise<{ status: string; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if (result.status === 'error') setError(result.message ?? 'Error')
    })
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Product targets */}
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium text-sm">
          Productos target
          <span className="ml-2 text-xs text-muted-foreground font-normal">(vacío = aplica a todo)</span>
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
                    onClick={() => run(() => removeCouponProductTarget(couponId, t.productId))}
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
                run(() => addCouponProductTarget(couponId, Number(selectedProductId)))
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
          <span className="ml-2 text-xs text-muted-foreground font-normal">(vacío = aplica a todo)</span>
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
                    onClick={() => run(() => removeCouponComboTarget(couponId, t.comboId))}
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
                run(() => addCouponComboTarget(couponId, Number(selectedComboId)))
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
  )
}

export function CouponDeleteButton({ couponId, code }: { couponId: number; code: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar el cupón "${code}"?`)) return
    startTransition(async () => { await deleteCoupon(couponId) })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="w-full rounded-md border border-destructive px-4 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      {isPending ? 'Eliminando...' : 'Eliminar cupón'}
    </button>
  )
}
