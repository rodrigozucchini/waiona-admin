import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, Discount, DiscountStatus } from '@/types'
import { formatDate } from '@/lib/utils'

const statusConfig: Record<DiscountStatus, { label: string; className: string }> = {
  active:    { label: 'Activo',     className: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Programado', className: 'bg-blue-100 text-blue-700' },
  expired:   { label: 'Vencido',    className: 'bg-gray-100 text-gray-600' },
}

export default async function DiscountsPage() {
  const result = await api.get<PaginatedResponse<Discount>>('/discounts?limit=100')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Descuentos</h1>
          <p className="text-sm text-muted-foreground">Descuentos automáticos aplicados por el sistema.</p>
        </div>
        <Link
          href="/promotions/discounts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nuevo descuento
        </Link>
      </div>

      {result.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay descuentos configurados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Valor</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Vigencia</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.data.map((discount) => {
                const cfg = statusConfig[discount.status]
                return (
                  <tr key={discount.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{discount.name}</td>
                    <td className="px-4 py-3">
                      {discount.isPercentage ? `${discount.value}%` : `$${discount.value}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {discount.startsAt ? formatDate(discount.startsAt) : '—'}
                      {discount.endsAt ? ` → ${formatDate(discount.endsAt)}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/promotions/discounts/${discount.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
