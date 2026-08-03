'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteProduct } from '@/actions/product.actions'

export function DeleteProductButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Borrar este producto?')) return
    startTransition(async () => {
      const result = await deleteProduct(id)
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
