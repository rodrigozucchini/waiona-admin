'use client'

import { useActionState, useTransition, useState } from 'react'
import type { Tax, Product, Combo } from '@/types'
import {
  createTax,
  deleteTax,
  assignTaxToProduct,
  assignTaxToCombo,
  type TaxActionState,
} from '@/actions/taxes'

interface Props {
  taxTypeId: number
  taxes: Tax[]
  products: Product[]
  combos: Combo[]
}

const INPUT_CLASS =
  'w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'

export function TaxRatesClient({ taxTypeId, taxes, products, combos }: Props) {
  const createWithId = createTax.bind(null, taxTypeId)
  const [createState, createAction, isCreating] = useActionState(createWithId, { status: 'idle' })
  const [isPercentage, setIsPercentage] = useState(true)

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-medium">Tasas</h2>

      {taxes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay tasas configuradas para este tipo.</p>
      ) : (
        <div className="space-y-3">
          {taxes.map((tax) => (
            <TaxRateRow
              key={tax.id}
              taxTypeId={taxTypeId}
              tax={tax}
              products={products}
              combos={combos}
            />
          ))}
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-medium text-sm">Nueva tasa</h3>
        <form action={createAction} className="space-y-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-1 w-36">
              <label htmlFor="isPercentage" className="text-xs font-medium">Tipo</label>
              <select
                id="isPercentage"
                name="isPercentage"
                value={isPercentage ? 'true' : 'false'}
                onChange={(e) => setIsPercentage(e.target.value === 'true')}
                className={INPUT_CLASS}
              >
                <option value="true">Porcentaje (%)</option>
                <option value="false">Monto fijo ($)</option>
              </select>
            </div>

            <div className="space-y-1 w-40">
              <label htmlFor="value" className="text-xs font-medium">
                {isPercentage ? 'Valor (0.01 – 100)' : 'Monto (0.01 – 1.000.000)'}
              </label>
              <input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0.01"
                max={isPercentage ? 100 : 1_000_000}
                placeholder={isPercentage ? '21' : '1000'}
                className={INPUT_CLASS}
                required
              />
            </div>

            {!isPercentage && (
              <div className="space-y-1 w-24">
                <label htmlFor="currency" className="text-xs font-medium">Moneda</label>
                <select id="currency" name="currency" className={INPUT_CLASS}>
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            )}

            <div className="space-y-1 w-28">
              <label htmlFor="isGlobal" className="text-xs font-medium">Alcance</label>
              <select id="isGlobal" name="isGlobal" className={INPUT_CLASS}>
                <option value="true">Global</option>
                <option value="false">Específico</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreating ? '...' : 'Crear'}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            {isPercentage
              ? 'Los impuestos globales se aplican automáticamente a todos los productos y combos.'
              : 'Monto fijo requiere moneda. Los específicos se asignan manualmente a productos o combos.'}
          </p>
        </form>

        {createState.status === 'error' && (
          <p role="alert" className="mt-3 text-xs text-destructive">{createState.message}</p>
        )}
        {createState.status === 'success' && (
          <p className="mt-3 text-xs text-green-600">Tasa creada correctamente.</p>
        )}
      </div>
    </div>
  )
}

function TaxRateRow({
  taxTypeId,
  tax,
  products,
  combos,
}: {
  taxTypeId: number
  tax: Tax
  products: Product[]
  combos: Combo[]
}) {
  const [showAssign, setShowAssign] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [assignFeedback, setAssignFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function handleDelete() {
    if (!confirm(`¿Eliminar la tasa ${tax.isPercentage ? tax.value + '%' : '$' + tax.value}?`)) return
    startTransition(async () => {
      await deleteTax(taxTypeId, tax.id)
    })
  }

  async function handleAssignProduct(productId: number) {
    startTransition(async () => {
      const result = await assignTaxToProduct(productId, tax.id)
      setAssignFeedback(
        result.status === 'error'
          ? { ok: false, msg: result.message }
          : { ok: true, msg: 'Asignado al producto.' }
      )
    })
  }

  async function handleAssignCombo(comboId: number) {
    startTransition(async () => {
      const result = await assignTaxToCombo(comboId, tax.id)
      setAssignFeedback(
        result.status === 'error'
          ? { ok: false, msg: result.message }
          : { ok: true, msg: 'Asignado al combo.' }
      )
    })
  }

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium tabular-nums">
            {tax.isPercentage ? `${tax.value}%` : `$${tax.value}${tax.currency ? ` ${tax.currency}` : ''}`}
          </span>
          <span className="text-xs text-muted-foreground">
            {tax.isPercentage ? 'Porcentaje' : 'Monto fijo'}
          </span>
          {tax.isGlobal ? (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              Global
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              Específico
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!tax.isGlobal && (
            <button
              onClick={() => { setShowAssign((v) => !v); setAssignFeedback(null) }}
              className="text-sm text-primary hover:underline"
            >
              {showAssign ? 'Cerrar' : 'Asignar'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm text-destructive hover:underline disabled:opacity-50"
          >
            {isPending ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {tax.isGlobal && (
        <p className="px-4 pb-3 text-xs text-muted-foreground">
          Se aplica automáticamente a todos los productos y combos.
        </p>
      )}

      {!tax.isGlobal && showAssign && (
        <div className="border-t bg-muted/30 px-4 py-4 space-y-4">
          <p className="text-xs font-medium">Asignar impuesto a:</p>
          <AssignPanel
            label="Producto"
            items={products.map((p) => ({ id: p.id, label: `${p.sku} · ${p.name}` }))}
            onAssign={handleAssignProduct}
            isPending={isPending}
          />
          <AssignPanel
            label="Combo"
            items={combos.map((c) => ({ id: c.id, label: c.name }))}
            onAssign={handleAssignCombo}
            isPending={isPending}
          />
          {assignFeedback && (
            <p className={`text-xs ${assignFeedback.ok ? 'text-green-600' : 'text-destructive'}`}>
              {assignFeedback.msg}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function AssignPanel({
  label,
  items,
  onAssign,
  isPending,
}: {
  label: string
  items: { id: number; label: string }[]
  onAssign: (id: number) => void
  isPending: boolean
}) {
  const [selectedId, setSelectedId] = useState<number | ''>('')

  if (items.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        No hay {label.toLowerCase()}s disponibles.
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="space-y-1 flex-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
          className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccionar {label.toLowerCase()}...</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => { if (selectedId !== '') onAssign(selectedId) }}
        disabled={selectedId === '' || isPending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        Asignar
      </button>
    </div>
  )
}
