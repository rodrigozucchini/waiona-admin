'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteTax } from '@/actions/tax.actions'

export function DeleteTaxButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Borrar este impuesto?')) return
    startTransition(async () => {
      const result = await deleteTax(id)
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
