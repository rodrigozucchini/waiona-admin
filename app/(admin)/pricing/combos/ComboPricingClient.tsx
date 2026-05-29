'use client'

import { useActionState, useState, useTransition } from 'react'
import type { Combo, Margin, ComboPricing } from '@/types'
import {
  createComboPricing,
  updateComboPricing,
  deleteComboPricing,
} from '@/actions/pricing'

interface Props {
  combos: Combo[]
  pricings: ComboPricing[]
  margins: Margin[]
}

function computePreview(unitPrice: number, marginIdStr: string, margins: Margin[]) {
  if (!unitPrice || unitPrice <= 0) return null
  const margin = margins.find((m) => String(m.id) === marginIdStr)
  const priceAfterMargin = margin ? unitPrice * (1 + margin.value / 100) : null
  return { unitPrice, margin: margin ?? null, priceAfterMargin }
}

export function ComboPricingClient({ combos, pricings, margins }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [createState, createAction, isCreating] = useActionState(createComboPricing, { status: 'idle' })

  const [previewUnitPrice, setPreviewUnitPrice] = useState('')
  const [previewMarginId, setPreviewMarginId] = useState('')

  const pricedComboIds = new Set(pricings.map((p) => p.comboId))
  const combosWithoutPricing = combos.filter((c) => !pricedComboIds.has(c.id))

  const pricingByCombo = pricings.reduce<Record<number, ComboPricing[]>>((acc, p) => {
    acc[p.comboId] = acc[p.comboId] ?? []
    acc[p.comboId].push(p)
    return acc
  }, {})
  const combosWithPricing = combos.filter((c) => pricingByCombo[c.id])

  function getMarginLabel(marginId: number | null) {
    if (!marginId) return '—'
    const m = margins.find((m) => m.id === marginId)
    return m ? `${m.name} (${m.value}%)` : '—'
  }

  const preview = computePreview(Number(previewUnitPrice), previewMarginId, margins)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setShowForm(!showForm); setPreviewUnitPrice(''); setPreviewMarginId('') }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? 'Cancelar' : 'Agregar precio'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 max-w-lg space-y-3">
          <h2 className="font-medium">Nuevo precio</h2>
          <form action={createAction} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="comboId" className="text-sm font-medium">Combo</label>
              {combosWithoutPricing.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todos los combos ya tienen precio configurado.</p>
              ) : (
                <select
                  id="comboId"
                  name="comboId"
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar combo</option>
                  {combosWithoutPricing.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="currency" className="text-sm font-medium">Moneda</label>
                <select
                  id="currency"
                  name="currency"
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="unitPrice" className="text-sm font-medium">Precio unitario</label>
                <input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={previewUnitPrice}
                  onChange={(e) => setPreviewUnitPrice(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="marginId" className="text-sm font-medium">Margen <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <select
                id="marginId"
                name="marginId"
                value={previewMarginId}
                onChange={(e) => setPreviewMarginId(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sin margen</option>
                {margins.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.value}%)</option>
                ))}
              </select>
            </div>

            {preview && (
              <div className="rounded-md bg-muted px-3 py-2 text-xs space-y-0.5">
                <p className="text-muted-foreground">Vista previa (sin impuestos ni descuentos)</p>
                <div className="flex justify-between">
                  <span>Precio base</span>
                  <span className="font-mono">{preview.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                {preview.margin && preview.priceAfterMargin && (
                  <div className="flex justify-between">
                    <span>Con margen ({preview.margin.value}%)</span>
                    <span className="font-mono font-medium">{preview.priceAfterMargin.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            )}

            {createState.status === 'error' && (
              <p role="alert" className="text-sm text-destructive">{createState.message}</p>
            )}

            <button
              type="submit"
              disabled={isCreating || combosWithoutPricing.length === 0}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isCreating ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      {pricings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="font-medium">Sin precios configurados</p>
          <p className="text-sm mt-1">Usá "Agregar precio" para configurar el precio de un combo.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Combo</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Moneda</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Precio base</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Margen</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {combosWithPricing.flatMap((combo) =>
                (pricingByCombo[combo.id] ?? []).map((pricing) => (
                  <ComboPricingRow
                    key={pricing.id}
                    comboName={combo.name}
                    pricing={pricing}
                    margins={margins}
                    getMarginLabel={getMarginLabel}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {combosWithoutPricing.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {combosWithoutPricing.length} combo{combosWithoutPricing.length !== 1 ? 's' : ''} sin precio configurado.
        </p>
      )}
    </div>
  )
}

function ComboPricingRow({
  comboName,
  pricing,
  margins,
  getMarginLabel,
}: {
  comboName: string
  pricing: ComboPricing
  margins: Margin[]
  getMarginLabel: (id: number | null) => string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()
  const updateWithId = updateComboPricing.bind(null, pricing.id)
  const [updateState, updateAction, isUpdating] = useActionState(updateWithId, { status: 'idle' })

  function handleDelete() {
    if (!confirm('¿Eliminar este precio?')) return
    startDeleteTransition(async () => { await deleteComboPricing(pricing.id) })
  }

  if (isEditing) {
    return (
      <tr>
        <td className="px-4 py-3 font-medium">{comboName}</td>
        <td className="px-4 py-3 text-muted-foreground">{pricing.currency}</td>
        <td colSpan={3} className="px-4 py-3">
          <form action={updateAction} className="flex gap-3 items-center flex-wrap">
            <input
              name="unitPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={pricing.unitPrice}
              className="w-32 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              name="marginId"
              defaultValue={pricing.marginId ?? ''}
              className="rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sin margen</option>
              {margins.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.value}%)</option>
              ))}
            </select>
            <button type="submit" disabled={isUpdating} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50">
              {isUpdating ? '...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="rounded-md border px-3 py-1.5 text-xs">
              Cancelar
            </button>
          </form>
          {updateState.status === 'error' && (
            <p className="mt-1 text-xs text-destructive">{updateState.message}</p>
          )}
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3 font-medium">{comboName}</td>
      <td className="px-4 py-3 text-muted-foreground">{pricing.currency}</td>
      <td className="px-4 py-3 text-right font-mono">{pricing.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
      <td className="px-4 py-3 text-muted-foreground">{getMarginLabel(pricing.marginId)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsEditing(true)} className="text-sm text-primary hover:underline">
            Editar
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className="text-sm text-destructive hover:underline disabled:opacity-50">
            {isDeleting ? '...' : 'Eliminar'}
          </button>
        </div>
      </td>
    </tr>
  )
}
