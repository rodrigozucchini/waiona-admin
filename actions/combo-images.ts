'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { api, ApiError } from '@/lib/api'
import type { ComboImage } from '@/types'

export type ImageActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadComboImage(
  comboId: number,
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

  formData.set('comboId', String(comboId))

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const res = await fetch(`${process.env.API_URL}/combo-images/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al subir la imagen' }))
    return { status: 'error', message: err.message }
  }

  revalidateTag('combos', 'max')
  return { status: 'success' }
}

export async function deleteComboImage(
  comboId: number,
  imageId: number
): Promise<ImageActionState> {
  try {
    await api.delete<ComboImage>(`/combo-images/${imageId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar la imagen' }
  }

  revalidateTag('combos', 'max')
  return { status: 'success' }
}

export async function updateComboImagePosition(
  comboId: number,
  imageId: number,
  _prev: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  const position = Number(formData.get('position'))
  if (!position || position < 1) return { status: 'error', message: 'La posición debe ser un número >= 1' }

  try {
    await api.patch(`/combo-images/${imageId}`, { position })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar la posición' }
  }

  revalidateTag('combos', 'max')
  return { status: 'success' }
}
