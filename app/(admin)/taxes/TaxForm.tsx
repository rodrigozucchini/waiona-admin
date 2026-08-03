'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createTax, updateTax } from '@/actions/tax.actions'
import type { TaxResponseDto } from '@/core/types'

interface TaxFormProps {
  tax?: TaxResponseDto
}

export function TaxForm({ tax }: TaxFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [code, setCode] = useState(tax?.code ?? '')
  const [name, setName] = useState(tax?.name ?? '')
  const [value, setValue] = useState(tax?.value != null ? String(tax.value) : '')
  const [isGlobal, setIsGlobal] = useState(tax?.isGlobal ?? false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { code: code.toUpperCase(), name: name.toUpperCase(), value: Number(value), isGlobal }

    startTransition(async () => {
      const result = tax ? await updateTax(tax.id, payload) : await createTax(payload)

      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(tax ? 'Impuesto actualizado' : 'Impuesto creado')
      router.push('/taxes')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <input
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Código (ej. IVA)"
        className="rounded border px-3 py-2"
      />
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
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
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} />
        Global (se aplica a todo automáticamente)
      </label>
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
