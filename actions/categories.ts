'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'
import type { Category } from '@/types'

export type CategoryActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

const CreateCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  description: z.string().max(1000).optional(),
  parentId: z.coerce.number().int().positive().optional(),
})

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  parentId: z.coerce.number().int().positive().optional(),
  isActive: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
})

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const result = CreateCategorySchema.safeParse({
    name: (formData.get('name') as string)?.trim(),
    description: (formData.get('description') as string)?.trim() || undefined,
    parentId: formData.get('parentId') || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<Category>('/categories', result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear la categoría' }
  }

  revalidateTag('categories', 'default')
  redirect('/catalog/categories')
}

export async function updateCategory(
  id: number,
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const result = UpdateCategorySchema.safeParse({
    name: (formData.get('name') as string)?.trim() || undefined,
    description: (formData.get('description') as string)?.trim() || undefined,
    parentId: formData.get('parentId') || undefined,
    isActive: formData.get('isActive') || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.patch<Category>(`/categories/${id}`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar la categoría' }
  }

  revalidateTag('categories', 'default')
  return { status: 'success' }
}

export async function deleteCategory(id: number): Promise<CategoryActionState> {
  try {
    await api.delete(`/categories/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar la categoría' }
  }

  revalidateTag('categories', 'default')
  redirect('/catalog/categories')
}
