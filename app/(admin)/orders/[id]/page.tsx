import { notFound } from 'next/navigation'
import { getOrder } from '@/services/order.service'
import { ApiError } from '@/core/lib/api'
import { OrderStatus } from '@/core/enums'
import { OrderStatusActions } from './OrderStatusActions'

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.CONFIRMED]: 'Confirmada',
  [OrderStatus.DISPATCHED]: 'Despachada',
  [OrderStatus.DELIVERED]: 'Entregada',
  [OrderStatus.CANCELLED]: 'Cancelada',
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await getOrder(Number(id)).catch((error) => {
    if (error instanceof ApiError && error.statusCode === 404) notFound()
    throw error
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orden #{order.id}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {STATUS_LABELS[order.status]} · Usuario #{order.userId} ·{' '}
            {new Date(order.createdAt).toLocaleString('es-AR')}
          </p>
        </div>
        <OrderStatusActions id={order.id} status={order.status} />
      </div>

      <div className="max-w-sm rounded border p-3 text-sm">
        <p>
          <span className="font-medium">Entrega:</span>{' '}
          {order.deliveryType === 'delivery' ? 'Envío' : 'Retiro'}
        </p>
        {order.address && (
          <p>
            <span className="font-medium">Dirección:</span> {order.address}
          </p>
        )}
        {order.notes && (
          <p>
            <span className="font-medium">Notas:</span> {order.notes}
          </p>
        )}
      </div>

      <table className="w-full max-w-2xl border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Ítem</th>
            <th className="py-2">Cantidad</th>
            <th className="py-2">Precio unitario</th>
            <th className="py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.productName ?? item.comboName}</td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2">${item.salePrice}</td>
              <td className="py-2">${item.finalPrice}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-b">
            <td colSpan={3} className="py-2 text-right">
              Subtotal
            </td>
            <td className="py-2">${order.subtotal}</td>
          </tr>
          {order.couponCode && (
            <tr className="border-b">
              <td colSpan={3} className="py-2 text-right">
                Cupón ({order.couponCode})
              </td>
              <td className="py-2">-${order.couponDiscount}</td>
            </tr>
          )}
          <tr>
            <td colSpan={3} className="py-2 text-right font-semibold">
              Total
            </td>
            <td className="py-2 font-semibold">${order.total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
