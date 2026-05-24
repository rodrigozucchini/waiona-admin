'use client'

import { useActionState, useTransition } from 'react'
import type { Tax } from '@/types'
import { createTax, deleteTax, type TaxActionState } from '@/actions/taxes'

interface Props {
  taxTypeId: number
  taxes: Tax[]
}

export function TaxRatesClient({ taxTypeId, taxes }: Props) {
  const createWithId = createTax.bind(null, taxTypeId)
  const [createState, createAction, isCreating] = useActionState(createWithId, { status: 'idle' })

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="font-medium">Tasas</h2>

      {taxes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay tasas configuradas para este tipo.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Valor</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Moneda</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Global</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {taxes.map((tax) => (
                <TaxRateRow key={tax.id} taxTypeId={taxTypeId} tax={tax} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-medium text-sm">Nueva tasa</h3>
        <form action={createAction} className="flex gap-3 items-end flex-wrap">
          <div className="space-y-1 w-24">
            <label htmlFor="value" className="text-xs font-medium">Valor %</label>
            <input
              id="value"
              name="value"
              type="number"
              step="0.01"
              min="0"
              placeholder="21"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1 w-24">
            <label htmlFor="currency" className="text-xs font-medium">Moneda</label>
            <select
              id="currency"
              name="currency"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="space-y-1 w-24">
            <label htmlFor="isGlobal" className="text-xs font-medium">Global</label>
            <select
              id="isGlobal"
              name="isGlobal"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isCreating ? '...' : 'Crear'}
          </button>
        </form>
        {createState.status === 'error' && (
          <p role="alert" className="mt-2 text-xs text-destructive">{createState.message}</p>
        )}
        {createState.status === 'success' && (
          <p className="mt-2 text-xs text-green-600">Tasa creada.</p>
        )}
      </div>
    </div>
  )
}

function TaxRateRow({ taxTypeId, tax }: { taxTypeId: number; tax: Tax }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar la tasa del ${tax.value}%?`)) return
    startTransition(async () => { await deleteTax(taxTypeId, tax.id) })
  }

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3 font-medium">
        {tax.isPercentage ? `${tax.value}%` : `$${tax.value}`}
      </td>
      <td className="px-4 py-3">{tax.currency}</td>
      <td className="px-4 py-3">{tax.isGlobal ? 'Sí' : 'No'}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm text-destructive hover:underline disabled:opacity-50"
        >
          {isPending ? '...' : 'Eliminar'}
        </button>
      </td>
    </tr>
  )
}
