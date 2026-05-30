'use client'

import { useActionState, useTransition, useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { Tax, Product } from '@/types'
import {
  createTax,
  deleteTax,
  assignTaxToProduct,
  type TaxActionState,
} from '@/actions/taxes'

interface Props {
  taxTypeId: number
  taxes: Tax[]
  products: Product[]
}

const INPUT_CLASS =
  'w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'

export function TaxRatesClient({ taxTypeId, taxes, products }: Props) {
  const createWithId = createTax.bind(null, taxTypeId)
  const [createState, createAction, isCreating] = useActionState(createWithId, { status: 'idle' })

  useEffect(() => {
    if (createState.status === 'success') toast.success('Tasa creada')
  }, [createState.status])

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
            />
          ))}
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-medium text-sm">Nueva tasa</h3>
        <form action={createAction} className="space-y-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-1 w-40">
              <label htmlFor="value" className="text-xs font-medium">Porcentaje (0.01 – 100)</label>
              <input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0.01"
                max={100}
                placeholder="21"
                className={INPUT_CLASS}
                required
              />
            </div>

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
            Los impuestos globales se aplican automáticamente a todos los productos.
            Los específicos se asignan manualmente.
          </p>
        </form>

        {createState.status === 'error' && (
          <p role="alert" className="mt-3 text-xs text-destructive">{createState.message}</p>
        )}
      </div>
    </div>
  )
}

function TaxRateRow({
  taxTypeId,
  tax,
  products,
}: {
  taxTypeId: number
  tax: Tax
  products: Product[]
}) {
  const [showAssign, setShowAssign] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar la tasa ${tax.value}%?`)) return
    startTransition(async () => {
      await deleteTax(taxTypeId, tax.id)
    })
  }

  async function handleAssignProduct(productId: number) {
    startTransition(async () => {
      const result = await assignTaxToProduct(productId, tax.id)
      if (result.status === 'error') toast.error(result.message)
      else toast.success('Impuesto asignado al producto')
    })
  }

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium tabular-nums">{tax.value}%</span>
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
              onClick={() => setShowAssign((v) => !v)}
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
          Se aplica automáticamente a todos los productos. Los combos heredan los impuestos de sus productos.
        </p>
      )}

      {!tax.isGlobal && showAssign && (
        <div className="border-t bg-muted/30 px-4 py-4 space-y-3">
          <p className="text-xs font-medium">Asignar a producto</p>
          <p className="text-xs text-muted-foreground">
            Los combos heredan los impuestos automáticamente desde sus productos.
          </p>
          <ProductAssignPanel
            products={products}
            onAssign={handleAssignProduct}
            isPending={isPending}
          />
        </div>
      )}
    </div>
  )
}

function ProductAssignPanel({
  products,
  onAssign,
  isPending,
}: {
  products: Product[]
  onAssign: (id: number) => void
  isPending: boolean
}) {
  const [selectedId, setSelectedId] = useState<number | ''>('')

  if (products.length === 0) {
    return <p className="text-xs text-muted-foreground">No hay productos disponibles.</p>
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="space-y-1 flex-1">
        <label className="text-xs text-muted-foreground">Producto</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
          className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccionar producto...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} · {p.name}
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
