'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { api, ApiError } from '@/lib/api'
import type { ProductImage } from '@/types'

export type ImageActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadProductImage(
  productId: number,
  _prev: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { status: 'error', message: 'Seleccioná una imagen' }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { status: 'error', message: 'Solo se permiten imágenes JPEG, PNG, WebP o GIF' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { status: 'error', message: 'La imagen no puede superar 5 MB' }
  }

  formData.set('productId', String(productId))

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const res = await fetch(`${process.env.API_URL}/product-images/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // No Content-Type — fetch sets the multipart boundary automáticamente
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al subir la imagen' }))
    return { status: 'error', message: err.message }
  }

  revalidatePath(`/catalog/products/${productId}`)
  revalidatePath(`/catalog/products/${productId}/images`)
  return { status: 'success' }
}

export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<ImageActionState> {
  try {
    await api.delete<ProductImage>(`/product-images/${imageId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar la imagen' }
  }

  revalidatePath(`/catalog/products/${productId}`)
  revalidatePath(`/catalog/products/${productId}/images`)
  return { status: 'success' }
}

export async function updateImagePosition(
  productId: number,
  imageId: number,
  _prev: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  const position = Number(formData.get('position'))
  if (!position || position < 1) return { status: 'error', message: 'La posición debe ser un número >= 1' }

  try {
    await api.patch(`/product-images/${imageId}`, { position })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar la posición' }
  }

  revalidatePath(`/catalog/products/${productId}/images`)
  return { status: 'success' }
}
