import { notFound } from 'next/navigation'
import { getProduct } from '@/services/product.service'
import { getCategories } from '@/services/category.service'
import { getProductImages } from '@/services/product-image.service'
import { getProductPricing } from '@/services/product-pricing.service'
import { getProductTaxes } from '@/services/product-tax.service'
import { getTaxes } from '@/services/tax.service'
import { ApiError } from '@/core/lib/api'
import { ProductForm } from '../ProductForm'
import { ProductImages } from './ProductImages'
import { ProductPricing } from './ProductPricing'
import { ProductTaxes } from './ProductTaxes'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, { data: categories }, images, pricing, productTaxes, { data: taxes }] =
    await Promise.all([
      getProduct(Number(id)).catch((error) => {
        if (error instanceof ApiError && error.statusCode === 404) notFound()
        throw error
      }),
      getCategories({ limit: 100 }),
      getProductImages(Number(id)),
      getProductPricing(Number(id)),
      getProductTaxes(Number(id)),
      getTaxes({ limit: 100 }),
    ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Editar producto</h1>
        <ProductForm categories={categories} product={product} />
      </div>
      <ProductPricing productId={product.id} pricing={pricing} />
      <ProductTaxes productId={product.id} productTaxes={productTaxes} taxes={taxes} />
      <ProductImages productId={product.id} images={images} />
    </div>
  )
}
