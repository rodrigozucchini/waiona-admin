'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { writeOffStock } from '@/actions/stock-item.actions'
import { StockWriteOffReason } from '@/core/enums'
import type { StockItemResponseDto } from '@/core/types'

const REASON_LABELS: Record<StockWriteOffReason, string> = {
  [StockWriteOffReason.DAMAGED]: 'Dañado',
  [StockWriteOffReason.EXPIRED]: 'Vencido',
  [StockWriteOffReason.DEFECTIVE]: 'Defectuoso',
  [StockWriteOffReason.CONTAMINATED]: 'Contaminado',
  [StockWriteOffReason.LOST]: 'Perdido',
  [StockWriteOffReason.INVENTORY_ERROR]: 'Error de inventario',
  [StockWriteOffReason.OTHER]: 'Otro',
}

export function WriteOffForm({ item }: { item: StockItemResponseDto }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [quantity, setQuantity] = useState('1')
  const [reason, setReason] = useState<StockWriteOffReason>(StockWriteOffReason.DAMAGED)
  const [description, setDescription] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await writeOffStock({
        stockItemId: item.id,
        quantity: Number(quantity),
        reason,
        ...(description && { description }),
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success('Baja registrada')
      setQuantity('1')
      setDescription('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3 rounded border p-3">
      <span className="text-sm font-medium">Dar de baja</span>
      <input
        required
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Cantidad"
        className="rounded border px-3 py-2"
      />
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as StockWriteOffReason)}
        className="rounded border px-3 py-2"
      >
        {Object.values(StockWriteOffReason).map((r) => (
          <option key={r} value={r}>
            {REASON_LABELS[r]}
          </option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className="rounded border px-3 py-2"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded border px-3 py-2 text-sm text-red-600 disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Dar de baja'}
      </button>
    </form>
  )
}
