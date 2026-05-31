'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'

export type OrderActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
    message: 'Estado inválido',
  }),
})

export async function updateOrderStatus(
  orderId: number,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const result = UpdateOrderStatusSchema.safeParse({ status: formData.get('status') })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Estado inválido' }
  }

  try {
    await api.patch(`/orders/${orderId}/status`, { status: result.data.status })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el estado' }
  }

  revalidateTag('orders', 'default')
  return { status: 'success' }
}
