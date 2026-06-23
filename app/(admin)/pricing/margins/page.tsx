import { api } from '@/lib/api'
import { MarginsClient } from './MarginsClient'
import type { PaginatedResponse, Margin } from '@/types'

export default async function MarginsPage() {
  const margins = await api.get<PaginatedResponse<Margin>>('/margins?limit=100').then((r) => r.data)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Márgenes</h1>
        <p className="text-sm text-muted-foreground">
          Porcentajes de margen aplicados sobre el precio base.
        </p>
      </div>

      <MarginsClient margins={margins} />
    </div>
  )
}
