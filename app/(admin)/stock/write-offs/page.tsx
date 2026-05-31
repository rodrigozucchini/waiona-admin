import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, StockWriteOff } from '@/types'
import { formatDate } from '@/lib/utils'
import { WriteOffsFilter } from './WriteOffsFilter'

const reasonLabels: Record<string, string> = {
  DAMAGED: 'Daño físico',
  EXPIRED: 'Vencimiento',
  DEFECTIVE: 'Defecto de fabricación',
  CONTAMINATED: 'Contaminación',
  LOST: 'Pérdida',
  INVENTORY_ERROR: 'Error de inventario',
  OTHER: 'Otro',
}

export default async function StockWriteOffsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; reason?: string }>
}) {
  const { page = '1', reason = '' } = await searchParams

  const query = new URLSearchParams({ page, limit: '50' })
  if (reason) query.set('reason', reason)

  const result = await api.get<PaginatedResponse<StockWriteOff>>(
    `/stock-write-offs?${query}`
  )

  const { data: writeOffs, total, totalPages } = result
  const currentPage = Number(page)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bajas</h1>
          <p className="text-sm text-muted-foreground">Registro de bajas de inventario.</p>
        </div>
        <WriteOffsFilter current={reason} />
      </div>

      {writeOffs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin bajas registradas.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Ítem</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Cantidad</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Razón</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Descripción</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {writeOffs.map((wo) => (
                <tr key={wo.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/stock/items/${wo.stockItemId}`}
                      className="text-primary hover:underline"
                    >
                      #{wo.stockItemId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{wo.quantity}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      {reasonLabels[wo.reason] ?? wo.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {wo.description ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(wo.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{total} bajas</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/stock/write-offs?page=${currentPage - 1}${reason ? `&reason=${reason}` : ''}`}
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
                href={`/stock/write-offs?page=${currentPage + 1}${reason ? `&reason=${reason}` : ''}`}
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
