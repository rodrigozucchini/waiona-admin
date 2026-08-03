import { getCategories } from '@/services/category.service'
import { getProducts } from '@/services/product.service'
import { ComboForm } from '../ComboForm'

export default async function NewComboPage() {
  const [{ data: categories }, { data: products }] = await Promise.all([
    getCategories({ limit: 100 }),
    getProducts({ limit: 100 }),
  ])

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Nuevo combo</h1>
      <ComboForm categories={categories} products={products} />
    </div>
  )
}
