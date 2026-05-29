'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { api, ApiError } from '@/lib/api'
import type { StockLocation, StockItem, StockLocationType } from '@/types'

export type StockActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

function getSubFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return typeof payload.sub === 'number' ? payload.sub : null
  } catch {
    return null
  }
}

// ─── Stock Locations ──────────────────────────────────────────────────────────

export async function createStockLocation(
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const name = (formData.get('name') as string)?.trim()
  const type = formData.get('type') as StockLocationType
  const address = (formData.get('address') as string)?.trim() || undefined

  if (!name) return { status: 'error', message: 'El nombre es requerido' }
  if (!type) return { status: 'error', message: 'El tipo es requerido' }

  try {
    await api.post<StockLocation>('/stock-locations', { name, type, address })
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
  formData: FormData
): Promise<StockActionState> {
  const name = (formData.get('name') as string)?.trim() || undefined
  const address = (formData.get('address') as string)?.trim() || undefined

  try {
    await api.patch<StockLocation>(`/stock-locations/${id}`, { name, address })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar' }
  }

  revalidatePath('/stock/locations')
  return { status: 'success' }
}

export async function deleteStockLocation(id: number): Promise<StockActionState> {
  try {
    await api.delete(`/stock-locations/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar' }
  }

  revalidatePath('/stock/locations')
  return { status: 'success' }
}

// ─── Stock Items ──────────────────────────────────────────────────────────────

export async function createStockItem(
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const productId = Number(formData.get('productId'))
  const locationId = Number(formData.get('locationId'))
  const stockMin = Number(formData.get('stockMin'))
  const stockCritical = Number(formData.get('stockCritical'))

  if (!productId) return { status: 'error', message: 'Seleccioná un producto' }
  if (!locationId) return { status: 'error', message: 'Seleccioná una ubicación' }
  if (stockMin < 1) return { status: 'error', message: 'El stock mínimo debe ser al menos 1' }
  if (stockCritical < 0) return { status: 'error', message: 'El stock crítico no puede ser negativo' }
  if (stockCritical >= stockMin) return { status: 'error', message: 'El stock crítico debe ser menor al mínimo' }

  let newItem: StockItem
  try {
    newItem = await api.post<StockItem>('/stock-items', { productId, locationId, stockMin, stockCritical })
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Ya existe stock para ese producto en esa ubicación' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el ítem de stock' }
  }

  revalidatePath('/stock/items')
  redirect(`/stock/items/${newItem.id}`)
}

export async function addStock(
  productId: number,
  locationId: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const quantity = Number(formData.get('quantity'))

  if (!quantity || quantity <= 0) return { status: 'error', message: 'La cantidad debe ser mayor a 0' }

  try {
    await api.post('/stock-items/add-stock', { productId, locationId, quantity })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al agregar stock' }
  }

  revalidatePath('/stock/items')
  return { status: 'success' }
}

export async function writeOff(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const quantity = Number(formData.get('quantity'))

  if (!quantity || quantity <= 0) return { status: 'error', message: 'La cantidad debe ser mayor a 0' }

  try {
    await api.post('/stock-items/write-off', { stockItemId, quantity })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al registrar la baja' }
  }

  revalidatePath('/stock/items')
  return { status: 'success' }
}

export async function writeOffDamage(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const quantity = Number(formData.get('quantity'))
  const reason = formData.get('reason') as string
  const description = (formData.get('description') as string)?.trim() || undefined

  if (!quantity || quantity <= 0) return { status: 'error', message: 'La cantidad debe ser mayor a 0' }
  if (!reason) return { status: 'error', message: 'Seleccioná un motivo' }

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const reportedBy = token ? getSubFromToken(token) : null

  if (!reportedBy) return { status: 'error', message: 'No se pudo identificar al usuario' }

  try {
    await api.post('/stock-items/write-off-damage', {
      stockItemId,
      quantity,
      reason,
      description,
      reportedBy,
    })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al registrar la baja por daño' }
  }

  revalidatePath('/stock/items')
  revalidatePath('/stock/write-offs')
  return { status: 'success' }
}

export async function updateThresholds(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const stockMin = Number(formData.get('stockMin'))
  const stockCritical = Number(formData.get('stockCritical'))

  if (stockMin < 1) return { status: 'error', message: 'El stock mínimo debe ser al menos 1' }
  if (stockCritical < 0) return { status: 'error', message: 'El stock crítico no puede ser negativo' }
  if (stockCritical >= stockMin) return { status: 'error', message: 'El stock crítico debe ser menor al mínimo' }

  try {
    await api.patch(`/stock-items/${stockItemId}/thresholds`, { stockMin, stockCritical })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar umbrales' }
  }

  revalidatePath(`/stock/items/${stockItemId}`)
  return { status: 'success' }
}
