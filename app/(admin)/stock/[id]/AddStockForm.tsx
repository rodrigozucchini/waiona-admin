'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addStock } from '@/actions/stock-item.actions'
import type { StockItemResponseDto } from '@/core/types'

export function AddStockForm({ item }: { item: StockItemResponseDto }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [quantity, setQuantity] = useState('1')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await addStock({
        productId: item.productId,
        locationId: item.locationId,
        quantity: Number(quantity),
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success('Stock agregado')
      setQuantity('1')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded border p-3">
      <span className="text-sm font-medium">Agregar stock</span>
      <input
        required
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-24 rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded border px-2 py-1 text-sm disabled:opacity-50"
      >
        {isPending ? 'Agregando...' : 'Agregar'}
      </button>
    </form>
  )
}
