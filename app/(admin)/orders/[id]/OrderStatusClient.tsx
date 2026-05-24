'use client'

import { useActionState } from 'react'
import type { OrderStatus } from '@/types'
import { updateOrderStatus } from '@/actions/orders'

const statusLabels: Record<OrderStatus, string> = {
  pending:    'Pendiente',
  confirmed:  'Confirmada',
  dispatched: 'Despachada',
  delivered:  'Entregada',
  cancelled:  'Cancelada',
}

interface Props {
  orderId: number
  currentStatus: OrderStatus
  allowedStatuses: OrderStatus[]
}

export function OrderStatusClient({ orderId, currentStatus, allowedStatuses }: Props) {
  const updateWithId = updateOrderStatus.bind(null, orderId)
  const [state, formAction, isPending] = useActionState(updateWithId, { status: 'idle' })

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h2 className="font-medium text-sm">Cambiar estado</h2>
      <form action={formAction} className="space-y-3">
        <select
          name="status"
          defaultValue=""
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="" disabled>Seleccionar nuevo estado...</option>
          {allowedStatuses.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
        {state.status === 'error' && (
          <p role="alert" className="text-xs text-destructive">{state.message}</p>
        )}
        {state.status === 'success' && (
          <p className="text-xs text-green-600">Estado actualizado.</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Actualizando...' : 'Confirmar cambio'}
        </button>
      </form>
    </div>
  )
}
