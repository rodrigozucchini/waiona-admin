'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { TaxType } from '@/types'
import { createTaxType, deleteTaxType, type TaxActionState } from '@/actions/taxes'
import { useTransition } from 'react'

export function TaxTypesClient({ taxTypes }: { taxTypes: TaxType[] }) {
  const [createState, createAction, isCreating] = useActionState(createTaxType, { status: 'idle' })

  return (
    <div className="space-y-6 max-w-xl">
      {taxTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay tipos de impuesto configurados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Código</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {taxTypes.map((tt) => (
                <TaxTypeRow key={tt.id} taxType={tt} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium text-sm">Nuevo tipo de impuesto</h2>
        <form action={createAction} className="flex gap-3 items-end">
          <div className="space-y-1 w-28">
            <label htmlFor="code" className="text-xs font-medium">Código</label>
            <input
              id="code"
              name="code"
              placeholder="IVA"
              className="w-full rounded-md border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1 flex-1">
            <label htmlFor="name" className="text-xs font-medium">Nombre</label>
            <input
              id="name"
              name="name"
              placeholder="Impuesto al Valor Agregado"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
          <p className="mt-2 text-xs text-green-600">Tipo de impuesto creado.</p>
        )}
      </div>
    </div>
  )
}

function TaxTypeRow({ taxType }: { taxType: TaxType }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar el tipo de impuesto "${taxType.name}"?`)) return
    startTransition(async () => { await deleteTaxType(taxType.id) })
  }

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3 font-mono font-medium">{taxType.code}</td>
      <td className="px-4 py-3">{taxType.name}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-3">
          <Link
            href={`/taxes/${taxType.id}`}
            className="text-sm text-primary hover:underline"
          >
            Ver tasas
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm text-destructive hover:underline disabled:opacity-50"
          >
            {isPending ? '...' : 'Eliminar'}
          </button>
        </div>
      </td>
    </tr>
  )
}
