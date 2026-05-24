'use client'

import { useActionState, useState } from 'react'
import type { StockItem } from '@/types'
import { addStock, writeOff, updateThresholds, type StockActionState } from '@/actions/stock'

type Operation = 'add' | 'writeoff' | 'thresholds' | null

const WRITEOFF_REASONS = [
  { value: 'DAMAGE', label: 'Daño' },
  { value: 'EXPIRY', label: 'Vencimiento' },
  { value: 'LOSS', label: 'Pérdida' },
  { value: 'OTHER', label: 'Otro' },
]

export function StockItemClient({ item }: { item: StockItem }) {
  const [operation, setOperation] = useState<Operation>(null)

  const addAction = addStock.bind(null, item.id)
  const writeOffAction = writeOff.bind(null, item.id)
  const thresholdsAction = updateThresholds.bind(null, item.id)

  const [addState, addFormAction, isAdding] = useActionState(addAction, { status: 'idle' })
  const [writeOffState, writeOffFormAction, isWritingOff] = useActionState(writeOffAction, { status: 'idle' })
  const [thresholdsState, thresholdsFormAction, isSavingThresholds] = useActionState(thresholdsAction, { status: 'idle' })

  function close() { setOperation(null) }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h2 className="font-medium text-sm">Operaciones</h2>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setOperation('add')}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Agregar stock
        </button>
        <button
          onClick={() => setOperation('writeoff')}
          className="rounded-md border border-destructive px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
        >
          Dar de baja
        </button>
        <button
          onClick={() => setOperation('thresholds')}
          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Umbrales
        </button>
      </div>

      {/* Add stock form */}
      {operation === 'add' && (
        <div className="border-t pt-4 space-y-3">
          <p className="text-xs font-medium">Agregar stock</p>
          <form action={addFormAction} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="add-qty" className="text-xs text-muted-foreground">Cantidad</label>
              <input
                id="add-qty"
                name="quantity"
                type="number"
                min="1"
                required
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="add-notes" className="text-xs text-muted-foreground">Notas (opcional)</label>
              <input
                id="add-notes"
                name="notes"
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {addState.status === 'error' && (
              <p role="alert" className="text-xs text-destructive">{addState.message}</p>
            )}
            {addState.status === 'success' && (
              <p className="text-xs text-green-600">Stock actualizado.</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isAdding}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                {isAdding ? 'Procesando...' : 'Confirmar'}
              </button>
              <button type="button" onClick={close} className="rounded-md border px-3 py-1.5 text-xs">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Write-off form */}
      {operation === 'writeoff' && (
        <div className="border-t pt-4 space-y-3">
          <p className="text-xs font-medium">Dar de baja stock</p>
          <p className="text-xs text-muted-foreground">
            Disponible: <strong>{item.quantityAvailable}</strong> unidades
          </p>
          <form action={writeOffFormAction} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="wo-qty" className="text-xs text-muted-foreground">Cantidad</label>
              <input
                id="wo-qty"
                name="quantity"
                type="number"
                min="1"
                max={item.quantityAvailable}
                required
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="wo-reason" className="text-xs text-muted-foreground">Razón</label>
              <select
                id="wo-reason"
                name="reason"
                required
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccionar...</option>
                {WRITEOFF_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="wo-desc" className="text-xs text-muted-foreground">Descripción (opcional)</label>
              <input
                id="wo-desc"
                name="description"
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="rounded bg-destructive/10 p-2 text-xs text-destructive">
              Esta operación no se puede deshacer.
            </p>
            {writeOffState.status === 'error' && (
              <p role="alert" className="text-xs text-destructive">{writeOffState.message}</p>
            )}
            {writeOffState.status === 'success' && (
              <p className="text-xs text-green-600">Baja registrada.</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isWritingOff}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {isWritingOff ? 'Procesando...' : 'Confirmar baja'}
              </button>
              <button type="button" onClick={close} className="rounded-md border px-3 py-1.5 text-xs">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thresholds form */}
      {operation === 'thresholds' && (
        <div className="border-t pt-4 space-y-3">
          <p className="text-xs font-medium">Actualizar umbrales</p>
          <form action={thresholdsFormAction} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label htmlFor="th-crit" className="text-xs text-muted-foreground">Crítico</label>
                <input
                  id="th-crit"
                  name="stockCritical"
                  type="number"
                  min="0"
                  defaultValue={item.stockCritical}
                  required
                  className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="th-min" className="text-xs text-muted-foreground">Mínimo</label>
                <input
                  id="th-min"
                  name="stockMin"
                  type="number"
                  min="0"
                  defaultValue={item.stockMin}
                  required
                  className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="th-max" className="text-xs text-muted-foreground">Máximo</label>
                <input
                  id="th-max"
                  name="stockMax"
                  type="number"
                  min="0"
                  defaultValue={item.stockMax}
                  required
                  className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {thresholdsState.status === 'error' && (
              <p role="alert" className="text-xs text-destructive">{thresholdsState.message}</p>
            )}
            {thresholdsState.status === 'success' && (
              <p className="text-xs text-green-600">Umbrales actualizados.</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSavingThresholds}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                {isSavingThresholds ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={close} className="rounded-md border px-3 py-1.5 text-xs">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
