import { api } from '@/lib/api'
import Link from 'next/link'
import type { CriticalStockItem } from '@/types'

export async function CriticalStockWidget() {
  const data = await api.get<CriticalStockItem[]>('/analytics/stock/critical')

  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-medium">Stock Crítico</h2>
        <p className="text-sm text-muted-foreground">
          Todo el stock está sobre los umbrales críticos.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="mb-4 font-medium text-red-800">
        Stock Crítico ({data.length})
      </h2>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">{item.locationName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-700">{item.quantityAvailable} u.</p>
              <Link
                href={`/stock/items/${item.id}`}
                className="text-xs underline text-red-700"
              >
                Ver stock
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
