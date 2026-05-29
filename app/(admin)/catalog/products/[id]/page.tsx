import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/forms/ProductForm'
import { updateProduct, deleteProduct } from '@/actions/products'
import { DeleteButton } from '@/components/shared/DeleteButton'
import type { PaginatedResponse, Product, Category, ProductImage } from '@/types'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let product: Product
  try {
    product = await api.get<Product>(`/products/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const [categoriesResult, images] = await Promise.all([
    api.get<PaginatedResponse<Category>>('/categories?limit=100'),
    api.get<ProductImage[]>(`/product-images/product/${id}`).catch(() => [] as ProductImage[]),
  ])

  const updateWithId = updateProduct.bind(null, product.id)
  const deleteWithId = deleteProduct.bind(null, product.id)

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/catalog/products" className="hover:underline">Productos</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <DeleteButton
            action={deleteWithId}
            label="Eliminar producto"
            confirmMessage={`¿Eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`}
          />
        </div>
        <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductForm
            action={updateWithId}
            product={product}
            categories={categoriesResult.data}
          />
        </div>

        <div className="space-y-4">
          <h2 className="font-medium">Imágenes</h2>
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin imágenes</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {images
                .sort((a, b) => a.position - b.position)
                .map((img) => (
                  <div key={img.id} className="overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={product.name}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                ))}
            </div>
          )}
          <Link
            href={`/catalog/products/${product.id}/images`}
            className="inline-block text-sm text-primary hover:underline"
          >
            Gestionar imágenes →
          </Link>
        </div>
      </div>
    </div>
  )
}
