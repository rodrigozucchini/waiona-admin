'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/actions/auth.actions'

export function LogoutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logout()
      router.push('/login')
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
    >
      {isPending ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  )
}
