import { api } from '@/lib/api'
import Link from 'next/link'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { createCategory } from '@/actions/categories'
import type { PaginatedResponse, Category } from '@/types'

export default async function NewCategoryPage() {
  const result = await api.get<PaginatedResponse<Category>>('/categories?limit=100')

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

      <CategoryForm action={createCategory} categories={result.data} />
    </div>
  )
}
