import { notFound } from 'next/navigation'
import { getCombo } from '@/services/combo.service'
import { getCategories } from '@/services/category.service'
import { getProducts } from '@/services/product.service'
import { getComboImages } from '@/services/combo-image.service'
import { ApiError } from '@/core/lib/api'
import { ComboForm } from '../ComboForm'
import { ComboImages } from './ComboImages'

export default async function EditComboPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [combo, { data: categories }, { data: products }, images] = await Promise.all([
    getCombo(Number(id)).catch((error) => {
      if (error instanceof ApiError && error.statusCode === 404) notFound()
      throw error
    }),
    getCategories({ limit: 100 }),
    getProducts({ limit: 100 }),
    getComboImages(Number(id)),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Editar combo</h1>
        <ComboForm categories={categories} products={products} combo={combo} />
      </div>
      <ComboImages comboId={combo.id} images={images} />
    </div>
  )
}
