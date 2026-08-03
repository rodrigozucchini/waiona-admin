'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteCombo } from '@/actions/combo.actions'

export function DeleteComboButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Borrar este combo?')) return
    startTransition(async () => {
      const result = await deleteCombo(id)
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
