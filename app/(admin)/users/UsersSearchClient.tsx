'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function UsersSearchClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleFilter(key: 'name' | 'email', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')
    startTransition(() => {
      router.push(`${pathname}?${params}`)
    })
  }

  return (
    <div className={`flex gap-2 ${isPending ? 'opacity-50' : ''}`}>
      <input
        defaultValue={searchParams.get('name') ?? ''}
        onChange={(e) => handleFilter('name', e.target.value)}
        placeholder="Nombre o apellido"
        aria-label="Filtrar por nombre"
        className="rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-44"
      />
      <input
        defaultValue={searchParams.get('email') ?? ''}
        onChange={(e) => handleFilter('email', e.target.value)}
        placeholder="Email"
        aria-label="Filtrar por email"
        className="rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-48"
      />
    </div>
  )
}
