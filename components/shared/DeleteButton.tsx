'use client'

import { useTransition } from 'react'

interface ActionResult {
  status: string
  message?: string
}

interface Props {
  action: () => Promise<ActionResult | void>
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
    startTransition(async () => {
      const result = await action()
      if (result && result.status === 'error' && result.message) {
        alert(result.message)
      }
    })
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
