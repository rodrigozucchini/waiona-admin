import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, Coupon, CouponStatus } from '@/types'
import { formatDate } from '@/lib/utils'

const statusConfig: Record<CouponStatus, { label: string; className: string }> = {
  active:    { label: 'Activo',    className: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Programado', className: 'bg-blue-100 text-blue-700' },
  expired:   { label: 'Vencido',   className: 'bg-gray-100 text-gray-600' },
  exhausted: { label: 'Agotado',   className: 'bg-orange-100 text-orange-700' },
}

export default async function CouponsPage() {
  const result = await api.get<PaginatedResponse<Coupon>>('/coupons?limit=100')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cupones</h1>
          <p className="text-sm text-muted-foreground">Códigos de descuento para clientes.</p>
        </div>
        <Link
          href="/promotions/coupons/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nuevo cupón
        </Link>
      </div>

      {result.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay cupones configurados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Código</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Valor</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Usos</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Vence</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.data.map((coupon) => {
                const cfg = statusConfig[coupon.status]
                return (
                  <tr key={coupon.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                    <td className="px-4 py-3">
                      {coupon.value}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.usageCount}
                      {coupon.usageLimit !== undefined ? ` / ${coupon.usageLimit}` : ''}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {coupon.endsAt ? formatDate(coupon.endsAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/promotions/coupons/${coupon.id}`}
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
