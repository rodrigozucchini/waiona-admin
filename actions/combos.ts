'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Combo, CreateComboDto, UpdateComboDto } from '@/types'

export type ComboActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

export async function createCombo(
  _prev: ComboActionState,
  formData: FormData
): Promise<ComboActionState> {
  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string).trim()
  const categoryId = Number(formData.get('categoryId'))

  if (!name) return { status: 'error', message: 'El nombre es requerido' }
  if (!description || description.length < 5) return { status: 'error', message: 'La descripción es requerida (mínimo 5 caracteres)' }
  if (!categoryId) return { status: 'error', message: 'La categoría es requerida' }

  const itemsRaw = formData.get('items') as string
  let items: CreateComboDto['items'] = []
  try {
    items = JSON.parse(itemsRaw)
  } catch {
    return { status: 'error', message: 'Error en los items del combo' }
  }

  if (items.length === 0) {
    return { status: 'error', message: 'El combo debe tener al menos un producto' }
  }

  const dto: CreateComboDto = { name, description, categoryId, items }

  try {
    await api.post<Combo>('/combos', dto)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear el combo' }
  }

  revalidatePath('/catalog/combos')
  redirect('/catalog/combos')
}

export async function updateCombo(
  id: number,
  _prev: ComboActionState,
  formData: FormData
): Promise<ComboActionState> {
  const dto: UpdateComboDto = {}

  const name = (formData.get('name') as string).trim()
  if (name) dto.name = name

  const description = (formData.get('description') as string).trim()
  if (description) dto.description = description

  const categoryId = formData.get('categoryId') as string
  if (categoryId) dto.categoryId = Number(categoryId)

  const isActive = formData.get('isActive')
  if (isActive !== null) dto.isActive = isActive === 'true'

  const itemsRaw = formData.get('items') as string
  if (itemsRaw) {
    try {
      dto.items = JSON.parse(itemsRaw)
    } catch {
      return { status: 'error', message: 'Error en los items del combo' }
    }
  }

  try {
    await api.patch<Combo>(`/combos/${id}`, dto)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el combo' }
  }

  revalidatePath('/catalog/combos')
  return { status: 'success' }
}

export async function deleteCombo(id: number): Promise<ComboActionState> {
  try {
    await api.delete(`/combos/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el combo' }
  }

  revalidatePath('/catalog/combos')
  redirect('/catalog/combos')
}
