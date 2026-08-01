import { notFound } from 'next/navigation'
import { getCategory } from '@/services/category.service'
import { ApiError } from '@/core/lib/api'
import { CategoryForm } from '../CategoryForm'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const category = await getCategory(Number(id)).catch((error) => {
    if (error instanceof ApiError && error.statusCode === 404) notFound()
    throw error
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Editar categoría</h1>
      <CategoryForm category={category} />
    </div>
  )
}
