import { api } from '@/lib/api'
import type { PaginatedResponse, StockLocation } from '@/types'
import { LocationsClient } from './LocationsClient'

export default async function StockLocationsPage() {
  const result = await api.get<PaginatedResponse<StockLocation>>('/stock-locations?limit=100')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ubicaciones</h1>
        <p className="text-sm text-muted-foreground">Depósitos y puntos de venta.</p>
      </div>
      <LocationsClient locations={result.data} />
    </div>
  )
}
