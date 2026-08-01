'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteCategory } from '@/actions/category.actions'

export function DeleteCategoryButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Borrar esta categoría?')) return
    startTransition(async () => {
      const result = await deleteCategory(id)
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
