'use client'

import { useActionState, useState, useEffect } from 'react'
import type { StockItem, StockWriteoffReason } from '@/types'
import { addStock, writeOff, writeOffDamage, updateThresholds } from '@/actions/stock'

const WRITE_OFF_REASONS: { value: StockWriteoffReason; label: string }[] = [
  { value: 'DAMAGED', label: 'Daño físico' },
  { value: 'EXPIRED', label: 'Vencimiento' },
  { value: 'DEFECTIVE', label: 'Defecto de fabricación' },
  { value: 'CONTAMINATED', label: 'Contaminación' },
  { value: 'LOST', label: 'Pérdida' },
  { value: 'INVENTORY_ERROR', label: 'Error de inventario' },
  { value: 'OTHER', label: 'Otro' },
]

type Panel = 'add' | 'writeoff' | 'damage' | 'thresholds' | null

export function StockItemClient({ item }: { item: StockItem }) {
  const [panel, setPanel] = useState<Panel>(null)

  const addAction = addStock.bind(null, item.productId, item.locationId)
  const writeOffAction = writeOff.bind(null, item.id)
  const writeOffDamageAction = writeOffDamage.bind(null, item.id)
  const updateThresholdsAction = updateThresholds.bind(null, item.id)

  const [addState, addFormAction, isAddPending] = useActionState(addAction, { status: 'idle' })
  const [writeOffState, writeOffFormAction, isWriteOffPending] = useActionState(writeOffAction, { status: 'idle' })
  const [damageState, damageFormAction, isDamagePending] = useActionState(writeOffDamageAction, { status: 'idle' })
  const [thresholdState, thresholdFormAction, isThresholdPending] = useActionState(updateThresholdsAction, { status: 'idle' })

  useEffect(() => {
    if (addState.status === 'success') setPanel(null)
  }, [addState.status])

  useEffect(() => {
    if (writeOffState.status === 'success') setPanel(null)
  }, [writeOffState.status])

  useEffect(() => {
    if (damageState.status === 'success') setPanel(null)
  }, [damageState.status])

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h2 className="font-medium text-sm">Operaciones</h2>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPanel(panel === 'add' ? null : 'add')}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Agregar stock
        </button>
        <button
          onClick={() => setPanel(panel === 'writeoff' ? null : 'writeoff')}
          className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
        >
          Baja manual
        </button>
        <button
          onClick={() => setPanel(panel === 'damage' ? null : 'damage')}
          className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/5"
        >
          Baja por daño
        </button>
        <button
          onClick={() => setPanel(panel === 'thresholds' ? null : 'thresholds')}
          className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
        >
          Umbrales
        </button>
      </div>

      {panel === 'add' && (
        <form action={addFormAction} className="space-y-3 border-t pt-4">
          <div className="space-y-1">
            <label htmlFor="add-quantity" className="text-xs font-medium">Cantidad a ingresar</label>
            <input
              id="add-quantity"
              name="quantity"
              type="number"
              min="1"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {addState.status === 'error' && (
            <p role="alert" className="text-xs text-destructive">{addState.message}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isAddPending}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {isAddPending ? 'Procesando...' : 'Confirmar ingreso'}
            </button>
            <button type="button" onClick={() => setPanel(null)} className="rounded-md border px-3 py-1.5 text-xs">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {panel === 'writeoff' && (
        <form action={writeOffFormAction} className="space-y-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Stock disponible: <strong>{item.quantityAvailable}</strong> u.
          </p>
          <div className="space-y-1">
            <label htmlFor="wo-quantity" className="text-xs font-medium">Cantidad a dar de baja</label>
            <input
              id="wo-quantity"
              name="quantity"
              type="number"
              min="1"
              max={item.quantityAvailable}
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
            Descuenta del stock disponible. Esta operación no se puede deshacer.
          </p>
          {writeOffState.status === 'error' && (
            <p role="alert" className="text-xs text-destructive">{writeOffState.message}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isWriteOffPending}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground disabled:opacity-50"
            >
              {isWriteOffPending ? 'Procesando...' : 'Confirmar baja'}
            </button>
            <button type="button" onClick={() => setPanel(null)} className="rounded-md border px-3 py-1.5 text-xs">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {panel === 'damage' && (
        <form action={damageFormAction} className="space-y-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Stock disponible: <strong>{item.quantityAvailable}</strong> u.
          </p>
          <div className="space-y-1">
            <label htmlFor="dmg-quantity" className="text-xs font-medium">Cantidad afectada</label>
            <input
              id="dmg-quantity"
              name="quantity"
              type="number"
              min="1"
              max={item.quantityAvailable}
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="dmg-reason" className="text-xs font-medium">Motivo</label>
            <select
              id="dmg-reason"
              name="reason"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccioná un motivo</option>
              {WRITE_OFF_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="dmg-description" className="text-xs font-medium">
              Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              id="dmg-description"
              name="description"
              rows={2}
              placeholder="Ej: Cajas rotas en tránsito"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="rounded border border-destructive/20 bg-red-50 px-3 py-2 text-xs text-red-700">
            Baja irreversible. Se registrará un informe de daño.
          </p>
          {damageState.status === 'error' && (
            <p role="alert" className="text-xs text-destructive">{damageState.message}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isDamagePending}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground disabled:opacity-50"
            >
              {isDamagePending ? 'Procesando...' : 'Registrar baja'}
            </button>
            <button type="button" onClick={() => setPanel(null)} className="rounded-md border px-3 py-1.5 text-xs">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {panel === 'thresholds' && (
        <form action={thresholdFormAction} className="space-y-3 border-t pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="thr-min" className="text-xs font-medium">Stock mínimo</label>
              <input
                id="thr-min"
                name="stockMin"
                type="number"
                min="1"
                defaultValue={item.stockMin}
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="thr-critical" className="text-xs font-medium">Stock crítico</label>
              <input
                id="thr-critical"
                name="stockCritical"
                type="number"
                min="0"
                defaultValue={item.stockCritical}
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          {thresholdState.status === 'error' && (
            <p role="alert" className="text-xs text-destructive">{thresholdState.message}</p>
          )}
          {thresholdState.status === 'success' && (
            <p className="text-xs text-green-600">Umbrales actualizados.</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isThresholdPending}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {isThresholdPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setPanel(null)} className="rounded-md border px-3 py-1.5 text-xs">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
