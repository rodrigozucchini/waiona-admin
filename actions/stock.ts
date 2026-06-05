'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { api, ApiError } from '@/lib/api'
import type { StockLocation, StockItem } from '@/types'

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

// ─── Schemas ──────────────────────────────────────────────────────────────────

const StockLocationTypeEnum = z.enum(['warehouse', 'store', 'other'])

const CreateStockLocationSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  type: StockLocationTypeEnum,
  address: z.string().max(500).optional(),
})

const UpdateStockLocationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address: z.string().max(500).optional(),
})

const CreateStockItemSchema = z
  .object({
    productId: z.coerce.number().int().positive('Seleccioná un producto'),
    locationId: z.coerce.number().int().positive('Seleccioná una ubicación'),
    stockMin: z.coerce.number().int().min(1, 'El stock mínimo debe ser al menos 1'),
    stockCritical: z.coerce.number().int().min(0, 'El stock crítico no puede ser negativo'),
  })
  .refine((d) => d.stockCritical < d.stockMin, {
    message: 'El stock crítico debe ser menor al mínimo',
    path: ['stockCritical'],
  })

const AddStockSchema = z.object({
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
})

const WriteOffSchema = z.object({
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
})

const WriteOffDamageSchema = z.object({
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
  reason: z.string().min(1, 'Seleccioná un motivo'),
  description: z.string().max(1000).optional(),
})

const ThresholdsSchema = z
  .object({
    stockMin: z.coerce.number().int().min(1, 'El stock mínimo debe ser al menos 1'),
    stockCritical: z.coerce.number().int().min(0, 'El stock crítico no puede ser negativo'),
  })
  .refine((d) => d.stockCritical < d.stockMin, {
    message: 'El stock crítico debe ser menor al mínimo',
    path: ['stockCritical'],
  })

// ─── Stock Locations ──────────────────────────────────────────────────────────

export async function createStockLocation(
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const result = CreateStockLocationSchema.safeParse({
    name: (formData.get('name') as string)?.trim(),
    type: formData.get('type'),
    address: (formData.get('address') as string)?.trim() || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<StockLocation>('/stock-locations', result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear la ubicación' }
  }


  return { status: 'success' }
}

export async function updateStockLocation(
  id: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const result = UpdateStockLocationSchema.safeParse({
    name: (formData.get('name') as string)?.trim() || undefined,
    address: (formData.get('address') as string)?.trim() || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.patch<StockLocation>(`/stock-locations/${id}`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar' }
  }


  return { status: 'success' }
}

export async function deleteStockLocation(id: number): Promise<StockActionState> {
  try {
    await api.delete(`/stock-locations/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar' }
  }


  return { status: 'success' }
}

// ─── Stock Items ──────────────────────────────────────────────────────────────

export async function createStockItem(
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const result = CreateStockItemSchema.safeParse({
    productId: formData.get('productId'),
    locationId: formData.get('locationId'),
    stockMin: formData.get('stockMin'),
    stockCritical: formData.get('stockCritical'),
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  let newItem: StockItem
  try {
    newItem = await api.post<StockItem>('/stock-items', result.data)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Ya existe stock para ese producto en esa ubicación' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el ítem de stock' }
  }


  redirect(`/stock/items/${newItem.id}`)
}

export async function addStock(
  productId: number,
  locationId: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const result = AddStockSchema.safeParse({ quantity: formData.get('quantity') })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Cantidad inválida' }
  }

  try {
    await api.post('/stock-items/add-stock', { productId, locationId, quantity: result.data.quantity })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al agregar stock' }
  }


  return { status: 'success' }
}

export async function writeOff(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const result = WriteOffSchema.safeParse({ quantity: formData.get('quantity') })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Cantidad inválida' }
  }

  try {
    await api.post('/stock-items/write-off', { stockItemId, quantity: result.data.quantity })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al registrar la baja' }
  }


  return { status: 'success' }
}

export async function writeOffDamage(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const result = WriteOffDamageSchema.safeParse({
    quantity: formData.get('quantity'),
    reason: formData.get('reason'),
    description: (formData.get('description') as string)?.trim() || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const reportedBy = token ? getSubFromToken(token) : null

  if (!reportedBy) return { status: 'error', message: 'No se pudo identificar al usuario' }

  try {
    await api.post('/stock-items/write-off-damage', {
      stockItemId,
      ...result.data,
      reportedBy,
    })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al registrar la baja por daño' }
  }


  return { status: 'success' }
}

export async function updateThresholds(
  stockItemId: number,
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const result = ThresholdsSchema.safeParse({
    stockMin: formData.get('stockMin'),
    stockCritical: formData.get('stockCritical'),
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.patch(`/stock-items/${stockItemId}/thresholds`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar umbrales' }
  }


  return { status: 'success' }
}
