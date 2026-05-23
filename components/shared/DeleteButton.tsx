'use client'

import { useTransition } from 'react'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: () => Promise<any>
  label?: string
  confirmMessage?: string
}

export function DeleteButton({
  action,
  label = 'Eliminar',
  confirmMessage = '¿Estás seguro? Esta acción no se puede deshacer.',
}: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(confirmMessage)) return
    startTransition(() => action())
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      {isPending ? 'Eliminando...' : label}
    </button>
  )
}
