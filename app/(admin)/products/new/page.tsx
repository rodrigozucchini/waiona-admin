import { getCategories } from '@/services/category.service'
import { ProductForm } from '../ProductForm'

export default async function NewProductPage() {
  const { data: categories } = await getCategories({ limit: 100 })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
