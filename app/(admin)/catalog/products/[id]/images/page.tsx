import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImageUploadForm, ImageCard } from './ProductImagesClient'
import {
  uploadProductImage,
  deleteProductImage,
  updateImagePosition,
} from '@/actions/product-images'
import type { Product, ProductImage } from '@/types'

export default async function ProductImagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = Number(id)

  let product: Product
  try {
    product = await api.get<Product>(`/products/${productId}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const images = await api
    .get<ProductImage[]>(`/product-images/product/${productId}`)
    .catch(() => [] as ProductImage[])

  const sorted = [...images].sort((a, b) => a.position - b.position)
  const nextPosition = sorted.length > 0 ? sorted[sorted.length - 1].position + 1 : 1

  const uploadAction = uploadProductImage.bind(null, productId)
  const deleteAction = deleteProductImage.bind(null, productId)
  const updatePositionAction = updateImagePosition.bind(null, productId)

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/catalog/products" className="hover:underline">Productos</Link>
          <span>/</span>
          <Link href={`/catalog/products/${productId}`} className="hover:underline">
            {product.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">Imágenes</span>
        </nav>
        <h1 className="text-2xl font-semibold">Imágenes — {product.name}</h1>
        <p className="text-sm text-muted-foreground">{sorted.length} imagen{sorted.length !== 1 ? 'es' : ''}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center text-muted-foreground">
              <p className="font-medium">Sin imágenes</p>
              <p className="mt-1 text-sm">Subí la primera imagen del producto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {sorted.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  deleteAction={deleteAction}
                  updatePositionAction={updatePositionAction}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <ImageUploadForm uploadAction={uploadAction} nextPosition={nextPosition} />
        </div>
      </div>
    </div>
  )
}
