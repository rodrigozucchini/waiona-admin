import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, Category } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const { page = '1', limit = '20' } = await searchParams
  const result = await api.get<PaginatedResponse<Category>>(
    `/categories?page=${page}&limit=${limit}`
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorías</h1>
          <p className="text-sm text-muted-foreground">{result.total} categorías</p>
        </div>
        <Link
          href="/catalog/categories/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nueva categoría
        </Link>
      </div>

      {result.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="font-medium">No hay categorías</p>
          <p className="mt-1 text-sm">Creá la primera categoría para organizar los productos.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Descripción</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.data.map((category) => (
                <tr key={category.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.description ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={category.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/catalog/categories/${category.id}`}
                      className="text-primary hover:underline"
                      aria-label={`Editar ${category.name}`}
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {result.page} de {result.totalPages}</span>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link href={`?page=${result.page - 1}&limit=${limit}`} className="hover:underline">
                Anterior
              </Link>
            )}
            {result.hasNextPage && (
              <Link href={`?page=${result.page + 1}&limit=${limit}`} className="hover:underline">
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
