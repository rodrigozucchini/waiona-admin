import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, Combo } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default async function CombosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const { page = '1', limit = '20' } = await searchParams
  const result = await api.get<PaginatedResponse<Combo>>(`/combos?page=${page}&limit=${limit}`)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Combos</h1>
          <p className="text-sm text-muted-foreground">{result.total} combos</p>
        </div>
        <Link
          href="/catalog/combos/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nuevo combo
        </Link>
      </div>

      {result.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="font-medium">No hay combos</p>
          <p className="mt-1 text-sm">Creá el primer combo del catálogo.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Categoría</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.data.map((combo) => (
                <tr key={combo.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{combo.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {combo.categoryName ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={combo.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/catalog/combos/${combo.id}`}
                      className="text-primary hover:underline"
                      aria-label={`Editar ${combo.name}`}
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
