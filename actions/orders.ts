'use server'

import { revalidateTag } from 'next/cache'
import { api, ApiError } from '@/lib/api'
import type { OrderStatus } from '@/types'

export type OrderActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

export async function updateOrderStatus(
  orderId: number,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const status = formData.get('status') as OrderStatus
  if (!status) return { status: 'error', message: 'Estado requerido' }

  try {
    await api.patch(`/orders/${orderId}/status`, { status })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el estado' }
  }

  revalidateTag('orders', 'default')
  return { status: 'success' }
}
