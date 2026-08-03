import { notFound } from 'next/navigation'
import { getProduct } from '@/services/product.service'
import { getCategories } from '@/services/category.service'
import { getProductImages } from '@/services/product-image.service'
import { ApiError } from '@/core/lib/api'
import { ProductForm } from '../ProductForm'
import { ProductImages } from './ProductImages'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, { data: categories }, images] = await Promise.all([
    getProduct(Number(id)).catch((error) => {
      if (error instanceof ApiError && error.statusCode === 404) notFound()
      throw error
    }),
    getCategories({ limit: 100 }),
    getProductImages(Number(id)),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Editar producto</h1>
        <ProductForm categories={categories} product={product} />
      </div>
      <ProductImages productId={product.id} images={images} />
    </div>
  )
}
