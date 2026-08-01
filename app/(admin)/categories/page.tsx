import Link from 'next/link'
import { getCategories } from '@/services/category.service'
import { DeleteCategoryButton } from './DeleteCategoryButton'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getCategories({ page: page ? Number(page) : 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <Link href="/categories/new" className="rounded bg-black px-3 py-2 text-white">
          Nueva categoría
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Descripción</th>
            <th className="py-2">Activa</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((category) => (
            <tr key={category.id} className="border-b">
              <td className="py-2">{category.name}</td>
              <td className="py-2">{category.description ?? '-'}</td>
              <td className="py-2">{category.isActive ? 'Sí' : 'No'}</td>
              <td className="py-2 text-right">
                <Link href={`/categories/${category.id}`} className="mr-4 text-sm underline">
                  Editar
                </Link>
                <DeleteCategoryButton id={category.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && (
          <Link href={`/categories?page=${currentPage - 1}`}>Anterior</Link>
        )}
        {currentPage < totalPages && (
          <Link href={`/categories?page=${currentPage + 1}`}>Siguiente</Link>
        )}
      </div>
    </div>
  )
}
