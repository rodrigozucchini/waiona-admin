import { api } from '@/lib/api'
import type { PaginatedResponse, Margin } from '@/types'
import { MarginsClient } from './MarginsClient'

export default async function MarginsPage() {
  const result = await api.get<PaginatedResponse<Margin>>('/margins?limit=100')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Márgenes</h1>
        <p className="text-sm text-muted-foreground">
          Porcentajes de margen aplicados sobre el precio base.
        </p>
      </div>

      <MarginsClient margins={result.data} />
    </div>
  )
}
