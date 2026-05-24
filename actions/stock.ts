'use server'

import { revalidatePath } from 'next/cache'
import { api, ApiError } from '@/lib/api'

export type StockActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

// ─── Locations ────────────────────────────────────────────────────────────────

export async function createStockLocation(
  _prev: StockActionState,
  formData: FormData,
): Promise<StockActionState> {
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const address = formData.get('address') as string

  if (!name) return { status: 'error', message: 'El nombre es requerido' }
  if (!type) return { status: 'error', message: 'El tipo es requerido' }

  try {
    await api.post('/stock-locations', { name, type, address: address || null })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear la ubicación' }
  }

  revalidatePath('/stock/locations')
  return { status: 'success' }
}

export async function updateStockLocation(
  id: number,
  _prev: StockActionState,
  formData: FormData,
): Promise<StockActionState> {
  const name = formData.get('name') as string
  const address = formData.get('address') as string

  try {
    await api.patch(`/stock-locations/${id}`, { name, address: address || null })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar la ubicación' }
  }

  revalidatePath('/stock/locations')
  return { status: 'success' }
}

export async function deleteStockLocation(id: number): Promise<StockActionState> {
  try {
    await api.delete(`/stock-locations/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar la ubicación' }
  }

  revalidatePath('/stock/locations')
  return { status: 'success' }
}

// ─── Stock Operations ─────────────────────────────────────────────────────────

export async function addStock(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData,
): Promise<StockActionState> {
  const quantity = Number(formData.get('quantity'))
  const notes = formData.get('notes') as string

  if (!quantity || quantity <= 0) return { status: 'error', message: 'La cantidad debe ser mayor a 0' }

  try {
    await api.post('/stock-items/add-stock', {
      stockItemId,
      quantity,
      notes: notes || undefined,
    })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al agregar stock' }
  }

  revalidatePath(`/stock/items/${stockItemId}`)
  revalidatePath('/stock/items')
  return { status: 'success' }
}

export async function writeOff(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData,
): Promise<StockActionState> {
  const quantity = Number(formData.get('quantity'))
  const reason = formData.get('reason') as string
  const description = formData.get('description') as string

  if (!quantity || quantity <= 0) return { status: 'error', message: 'La cantidad debe ser mayor a 0' }
  if (!reason) return { status: 'error', message: 'La razón es requerida' }

  try {
    await api.post('/stock-items/write-off', {
      stockItemId,
      quantity,
      reason,
      description: description || undefined,
    })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al dar de baja el stock' }
  }

  revalidatePath(`/stock/items/${stockItemId}`)
  revalidatePath('/stock/items')
  revalidatePath('/stock/write-offs')
  return { status: 'success' }
}

export async function updateThresholds(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData,
): Promise<StockActionState> {
  const stockCritical = Number(formData.get('stockCritical'))
  const stockMin = Number(formData.get('stockMin'))
  const stockMax = Number(formData.get('stockMax'))

  if (stockCritical >= stockMin) {
    return { status: 'error', message: 'El umbral crítico debe ser menor al mínimo' }
  }
  if (stockMin >= stockMax) {
    return { status: 'error', message: 'El mínimo debe ser menor al máximo' }
  }

  try {
    await api.patch(`/stock-items/${stockItemId}/thresholds`, {
      stockCritical,
      stockMin,
      stockMax,
    })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar umbrales' }
  }

  revalidatePath(`/stock/items/${stockItemId}`)
  revalidatePath('/stock/items')
  return { status: 'success' }
}
