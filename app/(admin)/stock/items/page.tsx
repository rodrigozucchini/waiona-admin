import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, StockItem } from '@/types'

function StockStatusBadge({ item }: { item: StockItem }) {
  if (item.quantityAvailable <= item.stockCritical) {
    return <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Crítico</span>
  }
  if (item.quantityAvailable <= item.stockMin) {
    return <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Bajo</span>
  }
  return <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Normal</span>
}

export default async function StockItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page = '1' } = await searchParams
  const result = await api.get<PaginatedResponse<StockItem>>(`/stock-items?page=${page}&limit=20`)
  const { data: items, total, totalPages } = result
  const currentPage = Number(page)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stock</h1>
          <p className="text-sm text-muted-foreground">Inventario por producto y ubicación.</p>
        </div>
        <Link
          href="/stock/items/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nuevo ítem
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin ítems de stock registrados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Producto</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Ubicación</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Disponible</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Reservado</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.locationName}</td>
                  <td className="px-4 py-3 text-right font-mono text-green-700">{item.quantityAvailable}</td>
                  <td className="px-4 py-3 text-right font-mono text-orange-600">{item.quantityReserved}</td>
                  <td className="px-4 py-3 text-right font-mono">{item.quantityCurrent}</td>
                  <td className="px-4 py-3"><StockStatusBadge item={item} /></td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/stock/items/${item.id}`}
                      className="text-primary hover:underline"
                      aria-label={`Ver stock de ${item.productName}`}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{total} ítems</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`/stock/items?page=${currentPage - 1}`} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                Anterior
              </Link>
            )}
            <span className="px-3 py-1.5 text-muted-foreground">{currentPage} / {totalPages}</span>
            {currentPage < totalPages && (
              <Link href={`/stock/items?page=${currentPage + 1}`} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
