'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'
import type { Combo } from '@/types'

export type ComboActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

const ComboItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

const CreateComboSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').max(2000),
  categoryId: z.coerce.number().int().positive('La categoría es requerida'),
  items: z.array(ComboItemSchema).min(1, 'El combo debe tener al menos un producto'),
})

const UpdateComboSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  isActive: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  items: z.array(ComboItemSchema).optional(),
})

export async function createCombo(
  _prev: ComboActionState,
  formData: FormData
): Promise<ComboActionState> {
  let items: unknown = []
  try {
    items = JSON.parse(formData.get('items') as string)
  } catch {
    return { status: 'error', message: 'Error en los items del combo' }
  }

  const result = CreateComboSchema.safeParse({
    name: (formData.get('name') as string)?.trim(),
    description: (formData.get('description') as string)?.trim(),
    categoryId: formData.get('categoryId'),
    items,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<Combo>('/combos', result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear el combo' }
  }

  revalidateTag('combos', 'max')
  redirect('/catalog/combos')
}

export async function updateCombo(
  id: number,
  _prev: ComboActionState,
  formData: FormData
): Promise<ComboActionState> {
  const raw: Record<string, unknown> = {}
  const name = (formData.get('name') as string)?.trim()
  if (name) raw.name = name
  const description = (formData.get('description') as string)?.trim()
  if (description) raw.description = description
  const categoryId = formData.get('categoryId') as string
  if (categoryId) raw.categoryId = categoryId
  const isActive = formData.get('isActive') as string
  if (isActive !== null) raw.isActive = isActive
  const itemsRaw = formData.get('items') as string
  if (itemsRaw) {
    try {
      raw.items = JSON.parse(itemsRaw)
    } catch {
      return { status: 'error', message: 'Error en los items del combo' }
    }
  }

  const result = UpdateComboSchema.safeParse(raw)
  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.patch<Combo>(`/combos/${id}`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el combo' }
  }

  revalidateTag('combos', 'max')
  return { status: 'success' }
}

export async function deleteCombo(id: number): Promise<ComboActionState> {
  try {
    await api.delete(`/combos/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el combo' }
  }

  revalidateTag('combos', 'max')
  redirect('/catalog/combos')
}
