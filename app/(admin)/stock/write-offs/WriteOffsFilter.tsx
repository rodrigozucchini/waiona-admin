'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function WriteOffsFilter({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('reason', value)
    else params.delete('reason')
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
      <option value="">Todos los motivos</option>
      <option value="DAMAGED">Daño físico</option>
      <option value="EXPIRED">Vencimiento</option>
      <option value="DEFECTIVE">Defecto de fabricación</option>
      <option value="CONTAMINATED">Contaminación</option>
      <option value="LOST">Pérdida</option>
      <option value="INVENTORY_ERROR">Error de inventario</option>
      <option value="OTHER">Otro</option>
    </select>
  )
}
