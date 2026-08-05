'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteStockLocation } from '@/actions/stock-location.actions'

export function DeleteStockLocationButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Borrar este depósito?')) return
    startTransition(async () => {
      const result = await deleteStockLocation(id)
      if (!result.success) toast.error(result.message)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-600 disabled:opacity-50"
    >
      Borrar
    </button>
  )
}
