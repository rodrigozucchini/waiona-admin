'use client'

import { useTransition } from 'react'
import { logoutAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'

interface Props {
  email: string
}

export function HeaderClient({ email }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(() => logoutAction())
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <span className="text-sm text-muted-foreground">{email}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isPending}
      >
        {isPending ? 'Saliendo...' : 'Cerrar sesión'}
      </Button>
    </header>
  )
}
