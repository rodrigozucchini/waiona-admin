'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { OrderStatus } from '@/types'

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '',           label: 'Todos' },
  { value: 'pending',    label: 'Pendiente' },
  { value: 'confirmed',  label: 'Confirmada' },
  { value: 'dispatched', label: 'Despachada' },
  { value: 'delivered',  label: 'Entregada' },
  { value: 'cancelled',  label: 'Cancelada' },
]

interface Props {
  currentStatus?: string
}

export function OrdersFilters({ currentStatus }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(value: string) {
    const params = new URLSearchParams()
    params.set('page', '1')
    if (value) params.set('status', value)
    router.push(`${pathname}?${params}`)
  }

  return (
    <select
      value={currentStatus ?? ''}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
