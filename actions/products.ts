'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types'

export type ProductActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const dto: CreateProductDto = {
    sku: (formData.get('sku') as string).trim().toUpperCase(),
    name: (formData.get('name') as string).trim(),
    categoryId: Number(formData.get('categoryId')),
    measurementUnit: formData.get('measurementUnit') as CreateProductDto['measurementUnit'],
  }

  const description = (formData.get('description') as string).trim()
  if (description) dto.description = description

  const measurementValue = formData.get('measurementValue') as string
  if (measurementValue) dto.measurementValue = Number(measurementValue)

  if (!dto.sku) return { status: 'error', message: 'El SKU es requerido' }
  if (!dto.name) return { status: 'error', message: 'El nombre es requerido' }
  if (!dto.categoryId) return { status: 'error', message: 'La categoría es requerida' }

  try {
    await api.post<Product>('/products', dto)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'El SKU ya existe' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el producto' }
  }

  revalidatePath('/catalog/products')
  redirect('/catalog/products')
}

export async function updateProduct(
  id: number,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const dto: UpdateProductDto = {}

  const name = (formData.get('name') as string).trim()
  if (name) dto.name = name

  const description = formData.get('description') as string
  dto.description = description.trim() || undefined

  const categoryId = formData.get('categoryId') as string
  if (categoryId) dto.categoryId = Number(categoryId)

  const measurementUnit = formData.get('measurementUnit') as string
  if (measurementUnit) dto.measurementUnit = measurementUnit as UpdateProductDto['measurementUnit']

  const measurementValue = formData.get('measurementValue') as string
  if (measurementValue) dto.measurementValue = Number(measurementValue)

  const isActive = formData.get('isActive')
  if (isActive !== null) dto.isActive = isActive === 'true'

  try {
    await api.patch<Product>(`/products/${id}`, dto)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el producto' }
  }

  revalidatePath('/catalog/products')
  return { status: 'success' }
}

export async function deleteProduct(id: number): Promise<ProductActionState> {
  try {
    await api.delete(`/products/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el producto' }
  }

  revalidatePath('/catalog/products')
  redirect('/catalog/products')
}
