'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types'

export type CategoryActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const dto: CreateCategoryDto = {
    name: (formData.get('name') as string).trim(),
  }

  const description = (formData.get('description') as string).trim()
  if (description) dto.description = description

  const parentId = formData.get('parentId') as string
  if (parentId) dto.parentId = Number(parentId)

  if (!dto.name) return { status: 'error', message: 'El nombre es requerido' }

  try {
    await api.post<Category>('/categories', dto)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear la categoría' }
  }

  revalidatePath('/catalog/categories')
  redirect('/catalog/categories')
}

export async function updateCategory(
  id: number,
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const dto: UpdateCategoryDto = {}

  const name = (formData.get('name') as string).trim()
  if (name) dto.name = name

  const description = formData.get('description') as string
  dto.description = description.trim() || undefined

  const parentId = formData.get('parentId') as string
  dto.parentId = parentId ? Number(parentId) : undefined

  const isActive = formData.get('isActive')
  if (isActive !== null) dto.isActive = isActive === 'true'

  try {
    await api.patch<Category>(`/categories/${id}`, dto)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar la categoría' }
  }

  revalidatePath('/catalog/categories')
  return { status: 'success' }
}

export async function deleteCategory(id: number): Promise<CategoryActionState> {
  try {
    await api.delete(`/categories/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar la categoría' }
  }

  revalidatePath('/catalog/categories')
  redirect('/catalog/categories')
}
