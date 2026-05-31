import Link from 'next/link'
import { ProductForm } from '@/components/forms/ProductForm'
import { createProduct } from '@/actions/products'
import { getCategories } from '@/lib/cache'

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/catalog/products" className="hover:underline">Productos</Link>
          <span>/</span>
          <span className="text-foreground">Nuevo</span>
        </nav>
        <h1 className="text-2xl font-semibold">Nuevo producto</h1>
      </div>

      <ProductForm action={createProduct} categories={categories} />
    </div>
  )
}
