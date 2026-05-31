import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { updateCategory, deleteCategory } from '@/actions/categories'
import { DeleteButton } from '@/components/shared/DeleteButton'
import { getCategories } from '@/lib/cache'
import type { Category } from '@/types'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let category: Category
  try {
    category = await api.get<Category>(`/categories/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const categories = await getCategories()
  const updateWithId = updateCategory.bind(null, category.id)
  const deleteWithId = deleteCategory.bind(null, category.id)

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/catalog/categories" className="hover:underline">Categorías</Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <DeleteButton
            action={deleteWithId}
            label="Eliminar categoría"
            confirmMessage={`¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`}
          />
        </div>
      </div>

      <CategoryForm action={updateWithId} category={category} categories={categories} />
    </div>
  )
}
