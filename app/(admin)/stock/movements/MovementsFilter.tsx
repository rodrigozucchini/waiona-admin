'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function MovementsFilter({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('operationType', value)
    else params.delete('operationType')
    params.set('page', '1')
    startTransition(() => router.push(`${pathname}?${params}`))
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
    >
      <option value="">Todos los tipos</option>
      <option value="ENTRY">Ingreso</option>
      <option value="EXIT">Egreso</option>
      <option value="ADJUSTMENT">Ajuste</option>
      <option value="DAMAGE">Daño</option>
      <option value="RETURN">Devolución</option>
    </select>
  )
}
