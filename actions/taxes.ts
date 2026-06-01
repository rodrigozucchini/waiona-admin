'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'
import type { TaxType, Tax } from '@/types'

export type TaxActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

// ─── Schemas ──────────────────────────────────────────────────────────────────

const TaxTypeSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(20),
  name: z.string().min(1, 'El nombre es requerido').max(100),
})

const TaxSchema = z.object({
  value: z.coerce
    .number()
    .min(0.01, 'El valor mínimo es 0.01')
    .max(100, 'El porcentaje no puede superar 100'),
  isGlobal: z.enum(['true', 'false']).transform((v) => v === 'true'),
})

// ─── Tax Types ────────────────────────────────────────────────────────────────

export async function createTaxType(
  _prev: TaxActionState,
  formData: FormData
): Promise<TaxActionState> {
  const result = TaxTypeSchema.safeParse({
    code: (formData.get('code') as string)?.trim().toUpperCase(),
    name: (formData.get('name') as string)?.trim(),
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<TaxType>('/tax-types', result.data)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 400) return { status: 'error', message: 'Ya existe un tipo de impuesto con ese código' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el tipo de impuesto' }
  }

  revalidateTag('taxes', 'max')
  return { status: 'success' }
}

export async function deleteTaxType(id: number): Promise<TaxActionState> {
  try {
    await api.delete(`/tax-types/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el tipo de impuesto' }
  }

  revalidateTag('taxes', 'max')
  redirect('/taxes')
}

// ─── Taxes ────────────────────────────────────────────────────────────────────

export async function createTax(
  taxTypeId: number,
  _prev: TaxActionState,
  formData: FormData
): Promise<TaxActionState> {
  const result = TaxSchema.safeParse({
    value: formData.get('value'),
    isGlobal: formData.get('isGlobal'),
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<Tax>(`/tax-types/${taxTypeId}/taxes`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear el impuesto' }
  }

  revalidateTag('taxes', 'max')
  return { status: 'success' }
}

export async function deleteTax(taxTypeId: number, taxId: number): Promise<TaxActionState> {
  try {
    await api.delete(`/tax-types/${taxTypeId}/taxes/${taxId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el impuesto' }
  }

  revalidateTag('taxes', 'max')
  return { status: 'success' }
}

// ─── Product Tax Assignment ───────────────────────────────────────────────────

export async function assignTaxToProduct(productId: number, taxId: number): Promise<TaxActionState> {
  try {
    await api.post(`/products/${productId}/taxes`, { taxId })
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.message.toLowerCase().includes('global')) {
        return { status: 'error', message: 'Este impuesto es global y ya aplica a todos los productos' }
      }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al asignar el impuesto' }
  }

  revalidateTag('taxes', 'max')
  return { status: 'success' }
}

export async function removeTaxFromProduct(productId: number, assignmentId: number): Promise<TaxActionState> {
  try {
    await api.delete(`/products/${productId}/taxes/${assignmentId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al quitar el impuesto' }
  }

  revalidateTag('taxes', 'max')
  return { status: 'success' }
}
