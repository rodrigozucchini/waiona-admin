'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function UsersSearchClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    startTransition(() => {
      router.push(`${pathname}?${params}`)
    })
  }

  return (
    <input
      defaultValue={searchParams.get('search') ?? ''}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Buscar por email..."
      className={`rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64 ${isPending ? 'opacity-50' : ''}`}
    />
  )
}
