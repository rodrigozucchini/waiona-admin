import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, Order, OrderStatus } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { OrdersFilters } from './OrdersFilters'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: 'Pendiente',   className: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Confirmada',  className: 'bg-blue-100 text-blue-700' },
  dispatched: { label: 'Despachada',  className: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Entregada',   className: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelada',   className: 'bg-red-100 text-red-700' },
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const { page = '1', status } = await searchParams

  const query = new URLSearchParams({ page, limit: '20' })
  if (status) query.set('status', status)

  const result = await api.get<PaginatedResponse<Order>>(`/orders?${query}`)
  const { data: orders, total, totalPages } = result
  const currentPage = Number(page)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Órdenes</h1>
          <p className="text-sm text-muted-foreground">{total} orden{total !== 1 ? 'es' : ''} en total.</p>
        </div>
        <OrdersFilters currentStatus={status} />
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay órdenes registradas.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">#</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Usuario</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Entrega</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Fecha</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const cfg = statusConfig[order.status]
                return (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-muted-foreground">#{order.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/users/${order.userId}`} className="hover:underline text-primary">
                        #{order.userId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {order.deliveryType === 'pickup' ? 'Retiro' : 'Delivery'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/orders/${order.id}`} className="text-sm text-primary hover:underline">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{total} órdenes</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/orders?page=${currentPage - 1}${status ? `&status=${status}` : ''}`}
                className="rounded-md border px-3 py-1.5 hover:bg-muted"
              >
                Anterior
              </Link>
            )}
            <span className="px-3 py-1.5 text-muted-foreground">{currentPage} / {totalPages}</span>
            {currentPage < totalPages && (
              <Link
                href={`/orders?page=${currentPage + 1}${status ? `&status=${status}` : ''}`}
                className="rounded-md border px-3 py-1.5 hover:bg-muted"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
