import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, StockItem, Product } from '@/types'

function StockStatusBadge({ item }: { item: StockItem }) {
  if (item.quantityAvailable <= item.stockCritical) {
    return <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Crítico</span>
  }
  if (item.quantityAvailable <= item.stockMin) {
    return <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Bajo</span>
  }
  return <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Normal</span>
}

export default async function StockItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page = '1' } = await searchParams

  const [itemsResult, productsResult] = await Promise.all([
    api.get<PaginatedResponse<StockItem>>(`/stock-items?page=${page}&limit=20`),
    api.get<PaginatedResponse<Product>>('/products?limit=100'),
  ])

  const productMap = new Map(productsResult.data.map((p) => [p.id, p]))

  const { data: items, total, totalPages } = itemsResult
  const currentPage = Number(page)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock</h1>
        <p className="text-sm text-muted-foreground">
          {total} ítem{total !== 1 ? 's' : ''} en inventario.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay ítems de stock registrados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Producto</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Ubicación</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actual</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Reservado</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Disponible</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => {
                const product = productMap.get(item.productId)
                return (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      {product ? (
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Producto #{item.productId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.locationName}</td>
                    <td className="px-4 py-3 text-right font-mono">{item.quantityCurrent}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{item.quantityReserved}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">{item.quantityAvailable}</td>
                    <td className="px-4 py-3">
                      <StockStatusBadge item={item} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/stock/items/${item.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{total} ítems</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/stock/items?page=${currentPage - 1}`}
                className="rounded-md border px-3 py-1.5 hover:bg-muted"
              >
                Anterior
              </Link>
            )}
            <span className="px-3 py-1.5 text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/stock/items?page=${currentPage + 1}`}
                className="rounded-md border px-3 py-1.5 hover:bg-muted"
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
