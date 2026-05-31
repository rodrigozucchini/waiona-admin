import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, StockMovement } from '@/types'
import { formatDate } from '@/lib/utils'
import { MovementsFilter } from './MovementsFilter'

const operationLabels: Record<string, string> = {
  ENTRY: 'Ingreso',
  EXIT: 'Egreso',
  ADJUSTMENT: 'Ajuste',
  DAMAGE: 'Daño',
  RETURN: 'Devolución',
}

export default async function StockMovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; operationType?: string }>
}) {
  const { page = '1', operationType = '' } = await searchParams

  const query = new URLSearchParams({ page, limit: '50' })
  if (operationType) query.set('operationType', operationType)

  const result = await api.get<PaginatedResponse<StockMovement>>(
    `/stock-movements?${query}`
  )

  const { data: movements, total, totalPages } = result
  const currentPage = Number(page)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Movimientos</h1>
          <p className="text-sm text-muted-foreground">Auditoría completa de movimientos de stock.</p>
        </div>
        <MovementsFilter current={operationType} />
      </div>

      {movements.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Ítem</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Operación</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Flujo</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Cantidad</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Referencia</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movements.map((mov) => (
                <tr key={mov.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/stock/items/${mov.stockItemId}`}
                      className="text-primary hover:underline"
                    >
                      #{mov.stockItemId}
                    </Link>
                  </td>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{total} movimientos</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/stock/movements?page=${currentPage - 1}${operationType ? `&operationType=${operationType}` : ''}`}
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
                href={`/stock/movements?page=${currentPage + 1}${operationType ? `&operationType=${operationType}` : ''}`}
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
