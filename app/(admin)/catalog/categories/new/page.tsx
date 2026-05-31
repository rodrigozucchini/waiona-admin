import Link from 'next/link'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { createCategory } from '@/actions/categories'
import { getCategories } from '@/lib/cache'

export default async function NewCategoryPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/catalog/categories" className="hover:underline">Categorías</Link>
          <span>/</span>
          <span className="text-foreground">Nueva</span>
        </nav>
        <h1 className="text-2xl font-semibold">Nueva categoría</h1>
      </div>

      <CategoryForm action={createCategory} categories={categories} />
    </div>
  )
}
