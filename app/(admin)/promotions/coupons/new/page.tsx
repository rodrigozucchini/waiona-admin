'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createCoupon } from '@/actions/promotions'

export default function NewCouponPage() {
  const [state, formAction, isPending] = useActionState(createCoupon, { status: 'idle' })

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/promotions/coupons" className="hover:underline">Cupones</Link>
          <span>/</span>
          <span className="text-foreground">Nuevo</span>
        </nav>
        <h1 className="text-2xl font-semibold">Nuevo cupón</h1>
      </div>

      <form action={formAction} className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1">
          <label htmlFor="code" className="text-sm font-medium">Código</label>
          <input
            id="code"
            name="code"
            placeholder="PROMO10"
            required
            className="w-full rounded-md border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
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
            <label htmlFor="isGlobal" className="text-sm font-medium">Alcance</label>
            <select
              id="isGlobal"
              name="isGlobal"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="false">Productos específicos</option>
              <option value="true">Global (todos)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="usageLimit" className="text-sm font-medium">Límite de usos</label>
            <input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              placeholder="Sin límite"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
            {isPending ? 'Creando...' : 'Crear cupón'}
          </button>
          <Link href="/promotions/coupons" className="rounded-md border px-4 py-2 text-sm hover:bg-muted">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
