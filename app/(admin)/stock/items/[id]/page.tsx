import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { StockItem, Product } from '@/types'
import { StockItemClient } from './StockItemClient'
import { formatDate } from '@/lib/utils'

export default async function StockItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let item: StockItem
  let product: Product | null = null

  try {
    item = await api.get<StockItem>(`/stock-items/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  try {
    product = await api.get<Product>(`/products/${item.productId}`)
  } catch {
    // product might be deleted; proceed without it
  }

  const operationLabels: Record<string, string> = {
    ENTRY: 'Ingreso',
    EXIT: 'Egreso',
    ADJUSTMENT: 'Ajuste',
    DAMAGE: 'Daño',
    RETURN: 'Devolución',
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/stock/items" className="hover:underline">Stock</Link>
          <span>/</span>
          <span className="text-foreground">{product?.name ?? `Ítem #${item.id}`}</span>
        </nav>
        <h1 className="text-2xl font-semibold">{product?.name ?? `Ítem #${item.id}`}</h1>
        {product && <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: summary + operations */}
        <div className="space-y-4">
          {/* Stock summary */}
          <div className="rounded-lg border p-4 space-y-3">
            <h2 className="font-medium text-sm">Inventario</h2>
            <div className="text-sm text-muted-foreground">{item.locationName}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold">{item.quantityCurrent}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-xl font-bold text-orange-600">{item.quantityReserved}</p>
                <p className="text-xs text-muted-foreground">Reservado</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{item.quantityAvailable}</p>
                <p className="text-xs text-muted-foreground">Disponible</p>
              </div>
            </div>
            <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Crítico</span>
                <span className="font-mono">{item.stockCritical}</span>
              </div>
              <div className="flex justify-between">
                <span>Mínimo</span>
                <span className="font-mono">{item.stockMin}</span>
              </div>
              <div className="flex justify-between">
                <span>Máximo</span>
                <span className="font-mono">{item.stockMax}</span>
              </div>
            </div>
          </div>

          {/* Operations panel */}
          <StockItemClient item={item} />
        </div>

        {/* Right: movement history */}
        <div className="lg:col-span-2">
          <h2 className="font-medium mb-3">Historial de movimientos</h2>
          {!item.movements || item.movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Operación</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Flujo</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Cantidad</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Referencia</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {item.movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        {operationLabels[mov.operationType] ?? mov.operationType}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mov.stockFlow === 'INBOUND' ? '↑ Entrada' : '↓ Salida'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{mov.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {mov.referenceType}
                        {mov.referenceId ? ` #${mov.referenceId}` : ''}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(mov.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
