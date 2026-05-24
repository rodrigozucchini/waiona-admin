'use client'

import { useActionState, useState } from 'react'
import type { Margin } from '@/types'
import {
  createMargin,
  updateMargin,
  deleteMargin,
  type PricingActionState,
} from '@/actions/pricing'

export function MarginsClient({ margins }: { margins: Margin[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [createState, createAction, isCreating] = useActionState(createMargin, { status: 'idle' })

  return (
    <div className="space-y-6 max-w-xl">
      {/* Tabla de márgenes */}
      {margins.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay márgenes configurados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Valor</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {margins.map((margin) => (
                <MarginRow
                  key={margin.id}
                  margin={margin}
                  isEditing={editingId === margin.id}
                  onEdit={() => setEditingId(margin.id)}
                  onCancel={() => setEditingId(null)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulario de creación */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium text-sm">Nuevo margen</h2>
        <form action={createAction} className="flex gap-3 items-end">
          <div className="space-y-1 flex-1">
            <label htmlFor="new-name" className="text-xs font-medium">Nombre</label>
            <input
              id="new-name"
              name="name"
              placeholder="Ej: Margen estándar"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1 w-28">
            <label htmlFor="new-value" className="text-xs font-medium">% Valor</label>
            <input
              id="new-value"
              name="value"
              type="number"
              step="0.01"
              min="0"
              max="999"
              placeholder="20"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isCreating ? 'Creando...' : 'Crear'}
          </button>
        </form>
        {createState.status === 'error' && (
          <p role="alert" className="mt-2 text-xs text-destructive">{createState.message}</p>
        )}
        {createState.status === 'success' && (
          <p className="mt-2 text-xs text-green-600">Margen creado.</p>
        )}
      </div>
    </div>
  )
}

function MarginRow({
  margin,
  isEditing,
  onEdit,
  onCancel,
}: {
  margin: Margin
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
}) {
  const updateWithId = updateMargin.bind(null, margin.id)
  const [updateState, updateAction, isUpdating] = useActionState(updateWithId, { status: 'idle' })
  const [deleteState, setDeleteState] = useState<{ error?: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`¿Eliminar el margen "${margin.name}"?`)) return
    setIsDeleting(true)
    const result = await deleteMargin(margin.id)
    if (result.status === 'error') {
      setDeleteState({ error: result.message })
    }
    setIsDeleting(false)
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={3} className="px-4 py-3">
          <form action={updateAction} className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                name="name"
                defaultValue={margin.name}
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="w-24">
              <input
                name="value"
                type="number"
                step="0.01"
                min="0"
                defaultValue={margin.value}
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border px-3 py-1.5 text-xs"
            >
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
      <td className="px-4 py-3 font-medium">{margin.name}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {margin.isPercentage ? `${margin.value}%` : `$${margin.value}`}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-3">
          {deleteState?.error && (
            <span className="text-xs text-destructive">{deleteState.error}</span>
          )}
          <button
            onClick={onEdit}
            className="text-sm text-primary hover:underline"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm text-destructive hover:underline disabled:opacity-50"
          >
            {isDeleting ? '...' : 'Eliminar'}
          </button>
        </div>
      </td>
    </tr>
  )
}
