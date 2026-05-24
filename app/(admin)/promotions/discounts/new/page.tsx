'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createDiscount } from '@/actions/promotions'

export default function NewDiscountPage() {
  const [state, formAction, isPending] = useActionState(createDiscount, { status: 'idle' })

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/promotions/discounts" className="hover:underline">Descuentos</Link>
          <span>/</span>
          <span className="text-foreground">Nuevo</span>
        </nav>
        <h1 className="text-2xl font-semibold">Nuevo descuento</h1>
      </div>

      <form action={formAction} className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">Nombre</label>
          <input
            id="name"
            name="name"
            placeholder="Black Friday"
            required
            minLength={3}
            maxLength={100}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium">Descripción (opcional)</label>
          <input
            id="description"
            name="description"
            placeholder="Descuento de temporada"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="value" className="text-sm font-medium">Valor</label>
            <input
              id="value"
              name="value"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="isPercentage" className="text-sm font-medium">Tipo</label>
            <select
              id="isPercentage"
              name="isPercentage"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="true">Porcentaje (%)</option>
              <option value="false">Monto fijo ($)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="startsAt" className="text-sm font-medium">Inicia</label>
            <input
              id="startsAt"
              name="startsAt"
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="endsAt" className="text-sm font-medium">Vence</label>
            <input
              id="endsAt"
              name="endsAt"
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {state.status === 'error' && (
          <p role="alert" className="text-sm text-destructive">{state.message}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Creando...' : 'Crear descuento'}
          </button>
          <Link href="/promotions/discounts" className="rounded-md border px-4 py-2 text-sm hover:bg-muted">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
