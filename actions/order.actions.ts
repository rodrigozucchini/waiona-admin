'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { OrderStatus } from '@/core/enums'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  try {
    await apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: { status } })
    revalidatePath('/orders')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
