'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createDiscount, updateDiscount } from '@/actions/discount.actions'
import type { DiscountResponseDto } from '@/core/types'

interface DiscountFormProps {
  discount?: DiscountResponseDto
}

export function DiscountForm({ discount }: DiscountFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(discount?.name ?? '')
  const [description, setDescription] = useState(discount?.description ?? '')
  const [value, setValue] = useState(discount?.value != null ? String(discount.value) : '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: name.toUpperCase(),
      ...(description && { description: description.toUpperCase() }),
      value: Number(value),
    }

    startTransition(async () => {
      const result = discount
        ? await updateDiscount(discount.id, payload)
        : await createDiscount(payload)

      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(discount ? 'Descuento actualizado' : 'Descuento creado')
      router.push('/discounts')
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
      <input
        required
        type="number"
        min={0.01}
        max={100}
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Valor (%)"
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
