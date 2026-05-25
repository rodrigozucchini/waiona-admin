'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-muted-foreground">Ocurrió un error al cargar las órdenes.</p>
      <button
        onClick={reset}
        className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
      >
        Reintentar
      </button>
    </div>
  )
}
