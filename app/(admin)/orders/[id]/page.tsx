import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Order, Payment, OrderStatus } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { OrderStatusClient } from './OrderStatusClient'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: 'Pendiente',   className: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Confirmada',  className: 'bg-blue-100 text-blue-700' },
  dispatched: { label: 'Despachada',  className: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Entregada',   className: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelada',   className: 'bg-red-100 text-red-700' },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Aprobado',  className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-600' },
}

// Allowed transitions per status
const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered:  [],
  cancelled:  [],
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let order: Order
  try {
    order = await api.get<Order>(`/orders/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  let payments: Payment[] = []
  try {
    payments = await api.get<Payment[]>(`/payments/order/${id}`)
  } catch {
    // payments may not exist yet
  }

  const cfg = statusConfig[order.status]
  const allowed = nextStatuses[order.status]

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/orders" className="hover:underline">Órdenes</Link>
          <span>/</span>
          <span className="text-foreground">#{order.id}</span>
        </nav>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Orden #{order.id}</h1>
          <span className={`rounded px-2 py-0.5 text-xs ${cfg.className}`}>{cfg.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: info + status change */}
        <div className="space-y-4">
          {/* Order info */}
          <div className="rounded-lg border p-4 space-y-3 text-sm">
            <h2 className="font-medium">Información</h2>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Usuario</span>
                <Link href={`/users/${order.userId}`} className="text-primary hover:underline">
                  #{order.userId}
                </Link>
              </div>
              <div className="flex justify-between">
                <span>Tipo de entrega</span>
                <span className="text-foreground">
                  {order.deliveryType === 'pickup' ? 'Retiro en local' : 'Delivery'}
                </span>
              </div>
              {order.address && (
                <div className="flex justify-between gap-4">
                  <span>Dirección</span>
                  <span className="text-foreground text-right">{order.address}</span>
                </div>
              )}
              {order.notes && (
                <div className="flex justify-between gap-4">
                  <span>Notas</span>
                  <span className="text-foreground text-right">{order.notes}</span>
                </div>
              )}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.couponDiscount !== null && order.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Cupón {order.couponCode && `(${order.couponCode})`}</span>
                    <span>-{formatCurrency(order.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-foreground">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status change */}
          {allowed.length > 0 && (
            <OrderStatusClient orderId={order.id} currentStatus={order.status} allowedStatuses={allowed} />
          )}

          {/* Payments */}
          {payments.length > 0 && (
            <div className="rounded-lg border p-4 space-y-3 text-sm">
              <h2 className="font-medium">Pagos</h2>
              {payments.map((payment) => {
                const pcfg = paymentStatusConfig[payment.status] ?? { label: payment.status, className: '' }
                return (
                  <div key={payment.id} className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span className="capitalize">{payment.provider}</span>
                      <span className={`rounded px-2 py-0.5 text-xs ${pcfg.className}`}>{pcfg.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monto</span>
                      <span className="text-foreground font-medium">{formatCurrency(payment.amount)}</span>
                    </div>
                    {payment.checkoutUrl && (
                      <a
                        href={payment.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Ver checkout
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: items */}
        <div className="lg:col-span-2">
          <h2 className="font-medium mb-3">Ítems</h2>
          {!order.items || order.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin ítems.</p>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Producto / Combo</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Cant.</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Precio unit.</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        {item.productName ?? item.comboName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.finalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium">Total</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
