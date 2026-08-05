'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createStockLocation, updateStockLocation } from '@/actions/stock-location.actions'
import { StockLocationType } from '@/core/enums'
import type { StockLocationResponseDto } from '@/core/types'

const TYPE_LABELS: Record<StockLocationType, string> = {
  [StockLocationType.WAREHOUSE]: 'Depósito',
  [StockLocationType.STORE]: 'Tienda',
  [StockLocationType.VIRTUAL]: 'Virtual',
}

interface StockLocationFormProps {
  location?: StockLocationResponseDto
}

export function StockLocationForm({ location }: StockLocationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(location?.name ?? '')
  const [type, setType] = useState<StockLocationType>(location?.type ?? StockLocationType.WAREHOUSE)
  const [address, setAddress] = useState(location?.address ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { name: name.toUpperCase(), type, ...(address && { address }) }

    startTransition(async () => {
      const result = location
        ? await updateStockLocation(location.id, payload)
        : await createStockLocation(payload)

      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(location ? 'Depósito actualizado' : 'Depósito creado')
      router.push('/stock/locations')
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
      <select
        value={type}
        onChange={(e) => setType(e.target.value as StockLocationType)}
        className="rounded border px-3 py-2"
      >
        {Object.values(StockLocationType).map((t) => (
          <option key={t} value={t}>
            {TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Dirección (opcional)"
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
