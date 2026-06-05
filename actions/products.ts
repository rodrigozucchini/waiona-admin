'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'
import type { Product } from '@/types'

export type ProductActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

const MeasurementUnit = z.enum(['unit', 'kg', 'gram', 'liter', 'ml', 'meter', 'cm', 'pack', 'box', 'dozen'])

const CreateProductSchema = z.object({
  sku: z.string().min(1, 'El SKU es requerido').max(100),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').max(2000),
  categoryId: z.coerce.number().int().positive('La categoría es requerida'),
  measurementUnit: MeasurementUnit,
  measurementValue: z.coerce.number().positive().optional(),
})

const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  measurementUnit: MeasurementUnit.optional(),
  measurementValue: z.coerce.number().positive().optional(),
  isActive: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
})

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const result = CreateProductSchema.safeParse({
    sku: (formData.get('sku') as string)?.trim(),
    name: (formData.get('name') as string)?.trim(),
    description: (formData.get('description') as string)?.trim(),
    categoryId: formData.get('categoryId'),
    measurementUnit: formData.get('measurementUnit'),
    measurementValue: formData.get('measurementValue') || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<Product>('/products', result.data)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'El SKU ya existe' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el producto' }
  }


  redirect('/catalog/products')
}

export async function updateProduct(
  id: number,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const raw: Record<string, unknown> = {}
  const name = (formData.get('name') as string)?.trim()
  if (name) raw.name = name
  const description = (formData.get('description') as string)?.trim()
  if (description) raw.description = description
  const categoryId = formData.get('categoryId') as string
  if (categoryId) raw.categoryId = categoryId
  const measurementUnit = formData.get('measurementUnit') as string
  if (measurementUnit) raw.measurementUnit = measurementUnit
  const measurementValue = formData.get('measurementValue') as string
  if (measurementValue) raw.measurementValue = measurementValue
  const isActive = formData.get('isActive') as string
  if (isActive !== null) raw.isActive = isActive

  const result = UpdateProductSchema.safeParse(raw)
  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.patch<Product>(`/products/${id}`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el producto' }
  }


  return { status: 'success' }
}

export async function deleteProduct(id: number): Promise<ProductActionState> {
  try {
    await api.delete(`/products/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el producto' }
  }


  redirect('/catalog/products')
}
