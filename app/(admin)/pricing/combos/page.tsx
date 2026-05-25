import { api } from '@/lib/api'
import type { PaginatedResponse, Combo, Margin, ComboPricing } from '@/types'
import { ComboPricingClient } from './ComboPricingClient'

export default async function ComboPricingPage() {
  const [combosResult, pricingsResult, marginsResult] = await Promise.all([
    api.get<PaginatedResponse<Combo>>('/combos?limit=100'),
    api.get<PaginatedResponse<ComboPricing>>('/combo-pricing?limit=100'),
    api.get<PaginatedResponse<Margin>>('/margins?limit=100'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Precios de combos</h1>
        <p className="text-sm text-muted-foreground">
          Precio base por combo y moneda, con margen opcional.
        </p>
      </div>

      <ComboPricingClient
        combos={combosResult.data}
        pricings={pricingsResult.data}
        margins={marginsResult.data}
      />
    </div>
  )
}
