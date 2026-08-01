'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createCategory, updateCategory } from '@/actions/category.actions'
import type { CategoryResponseDto } from '@/core/types'

interface CategoryFormProps {
  category?: CategoryResponseDto
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { name, ...(description && { description }) }

    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, payload)
        : await createCategory(payload)

      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(category ? 'Categoría actualizada' : 'Categoría creada')
      router.push('/categories')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
        className="rounded border px-3 py-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        className="rounded border px-3 py-2"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
