import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, Product } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>
}) {
  const { page = '1', limit = '20', search } = await searchParams

  const query = new URLSearchParams({ page, limit })
  if (search) query.set('search', search)

  const result = await api.get<PaginatedResponse<Product>>(`/products?${query}`)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">{result.total} productos</p>
        </div>
        <Link
          href="/catalog/products/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nuevo producto
        </Link>
      </div>

      <ProductSearch defaultValue={search} />

      {result.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="font-medium">No hay productos</p>
          {search ? (
            <p className="mt-1 text-sm">No se encontraron resultados para &quot;{search}&quot;.</p>
          ) : (
            <p className="mt-1 text-sm">Creá el primer producto del catálogo.</p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">SKU</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Categoría</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.data.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.categoryName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={product.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/catalog/products/${product.id}`}
                      className="text-primary hover:underline"
                      aria-label={`Editar ${product.name}`}
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
              <Link
                href={`?page=${result.page - 1}&limit=${limit}${search ? `&search=${search}` : ''}`}
                className="hover:underline"
              >
                Anterior
              </Link>
            )}
            {result.hasNextPage && (
              <Link
                href={`?page=${result.page + 1}&limit=${limit}${search ? `&search=${search}` : ''}`}
                className="hover:underline"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ProductSearch({ defaultValue }: { defaultValue?: string }) {
  return (
    <form method="GET" className="flex gap-2">
      <input
        name="search"
        defaultValue={defaultValue}
        placeholder="Buscar por nombre o SKU..."
        className="w-72 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
      >
        Buscar
      </button>
      {defaultValue && (
        <a href="/catalog/products" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
          Limpiar
        </a>
      )}
    </form>
  )
}
