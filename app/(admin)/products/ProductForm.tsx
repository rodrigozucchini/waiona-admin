'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createProduct, updateProduct } from '@/actions/product.actions'
import { ProductMeasurementUnit } from '@/core/enums'
import type { CategoryResponseDto, ProductResponseDto } from '@/core/types'

const MEASUREMENT_UNIT_LABELS: Record<ProductMeasurementUnit, string> = {
  [ProductMeasurementUnit.UNIT]: 'Unidad',
  [ProductMeasurementUnit.KG]: 'Kilogramo',
  [ProductMeasurementUnit.GRAM]: 'Gramo',
  [ProductMeasurementUnit.LITER]: 'Litro',
  [ProductMeasurementUnit.ML]: 'Mililitro',
  [ProductMeasurementUnit.METER]: 'Metro',
  [ProductMeasurementUnit.CM]: 'Centímetro',
  [ProductMeasurementUnit.PACK]: 'Pack',
  [ProductMeasurementUnit.BOX]: 'Caja',
  [ProductMeasurementUnit.DOZEN]: 'Docena',
}

interface ProductFormProps {
  categories: CategoryResponseDto[]
  product?: ProductResponseDto
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sku, setSku] = useState(product?.sku ?? '')
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [categoryId, setCategoryId] = useState(String(product?.categoryId ?? categories[0]?.id ?? ''))
  const [measurementUnit, setMeasurementUnit] = useState<ProductMeasurementUnit>(
    product?.measurementUnit ?? ProductMeasurementUnit.UNIT,
  )
  const [measurementValue, setMeasurementValue] = useState(
    product?.measurementValue != null ? String(product.measurementValue) : '',
  )
  const [isActive, setIsActive] = useState(product?.isActive ?? true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      sku,
      name,
      description,
      isActive,
      categoryId: Number(categoryId),
      measurementUnit,
      ...(measurementValue && { measurementValue: Number(measurementValue) }),
    }

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload)

      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(product ? 'Producto actualizado' : 'Producto creado')
      router.push('/products')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <input
        required
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        placeholder="SKU"
        className="rounded border px-3 py-2"
      />
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
        className="rounded border px-3 py-2"
      />
      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        className="rounded border px-3 py-2"
      />
      <select
        required
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="rounded border px-3 py-2"
      >
        <option value="" disabled>
          Categoría
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        value={measurementUnit}
        onChange={(e) => setMeasurementUnit(e.target.value as ProductMeasurementUnit)}
        className="rounded border px-3 py-2"
      >
        {Object.values(ProductMeasurementUnit).map((unit) => (
          <option key={unit} value={unit}>
            {MEASUREMENT_UNIT_LABELS[unit]}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        value={measurementValue}
        onChange={(e) => setMeasurementValue(e.target.value)}
        placeholder="Valor de medida (opcional)"
        className="rounded border px-3 py-2"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Activo
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
