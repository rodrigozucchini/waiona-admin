'use client'

import { useActionState, useState, useTransition } from 'react'
import type { StockLocation, StockLocationType } from '@/types'
import {
  createStockLocation,
  updateStockLocation,
  deleteStockLocation,
  type StockActionState,
} from '@/actions/stock'

const LOCATION_TYPES: { value: StockLocationType; label: string }[] = [
  { value: 'WAREHOUSE', label: 'Depósito' },
  { value: 'STORE', label: 'Local' },
  { value: 'VIRTUAL', label: 'Virtual' },
]

export function LocationsClient({ locations }: { locations: StockLocation[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [createState, createAction, isCreating] = useActionState(createStockLocation, { status: 'idle' })

  return (
    <div className="space-y-6 max-w-2xl">
      {locations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay ubicaciones configuradas.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Tipo</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Dirección</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {locations.map((loc) => (
                <LocationRow
                  key={loc.id}
                  location={loc}
                  isEditing={editingId === loc.id}
                  onEdit={() => setEditingId(loc.id)}
                  onCancel={() => setEditingId(null)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium text-sm">Nueva ubicación</h2>
        <form action={createAction} className="flex gap-3 items-end flex-wrap">
          <div className="space-y-1 flex-1 min-w-36">
            <label htmlFor="name" className="text-xs font-medium">Nombre</label>
            <input
              id="name"
              name="name"
              placeholder="Depósito Central"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1 w-36">
            <label htmlFor="type" className="text-xs font-medium">Tipo</label>
            <select
              id="type"
              name="type"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {LOCATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-48">
            <label htmlFor="address" className="text-xs font-medium">Dirección (opcional)</label>
            <input
              id="address"
              name="address"
              placeholder="Av. Corrientes 1234"
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
          <p className="mt-2 text-xs text-green-600">Ubicación creada.</p>
        )}
      </div>
    </div>
  )
}

function LocationRow({
  location,
  isEditing,
  onEdit,
  onCancel,
}: {
  location: StockLocation
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
}) {
  const updateWithId = updateStockLocation.bind(null, location.id)
  const [updateState, updateAction, isUpdating] = useActionState(updateWithId, { status: 'idle' })
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar la ubicación "${location.name}"?`)) return
    startTransition(async () => {
      const result = await deleteStockLocation(location.id)
      if (result.status === 'error') setDeleteError(result.message)
    })
  }

  const typeLabel = LOCATION_TYPES.find((t) => t.value === location.type)?.label ?? location.type

  if (isEditing) {
    return (
      <tr>
        <td colSpan={4} className="px-4 py-3">
          <form action={updateAction} className="flex gap-3 items-end flex-wrap">
            <input
              name="name"
              defaultValue={location.name}
              className="flex-1 min-w-32 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              name="address"
              defaultValue={location.address ?? ''}
              placeholder="Dirección"
              className="flex-1 min-w-48 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Guardar'}
            </button>
            <button type="button" onClick={onCancel} className="rounded-md border px-3 py-1.5 text-xs">
              Cancelar
            </button>
          </form>
          {updateState.status === 'error' && (
            <p className="mt-1 text-xs text-destructive">{updateState.message}</p>
          )}
          {updateState.status === 'success' && (onCancel(), null)}
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3 font-medium">{location.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{typeLabel}</td>
      <td className="px-4 py-3 text-muted-foreground">{location.address ?? '—'}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-3">
          {deleteError && <span className="text-xs text-destructive">{deleteError}</span>}
          <button onClick={onEdit} className="text-sm text-primary hover:underline">Editar</button>
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
