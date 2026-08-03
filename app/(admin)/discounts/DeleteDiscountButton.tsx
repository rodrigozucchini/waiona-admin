'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteDiscount } from '@/actions/discount.actions'

export function DeleteDiscountButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Borrar este descuento?')) return
    startTransition(async () => {
      const result = await deleteDiscount(id)
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
