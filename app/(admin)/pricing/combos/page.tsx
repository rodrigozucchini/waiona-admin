import { api } from '@/lib/api'
import type { PaginatedResponse, Combo, Margin, ComboPricing, PriceBreakdown } from '@/types'
import { ComboPricingClient } from './ComboPricingClient'

export default async function ComboPricingPage() {
  const [combosResult, pricingsResult, marginsResult] = await Promise.all([
    api.get<PaginatedResponse<Combo>>('/combos?limit=100'),
    api.get<PaginatedResponse<ComboPricing>>('/combo-pricing?limit=100'),
    api.get<PaginatedResponse<Margin>>('/margins?limit=100'),
  ])

  const calcResults = await Promise.allSettled(
    pricingsResult.data.map((p) =>
      api.post<PriceBreakdown>('/pricing/calculate/combo', { comboId: p.comboId })
    )
  )

  const calculations: Record<number, PriceBreakdown> = {}
  pricingsResult.data.forEach((p, i) => {
    const r = calcResults[i]
    if (r.status === 'fulfilled') calculations[p.id] = r.value
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Precios de combos</h1>
        <p className="text-sm text-muted-foreground">
          Precio base, margen e impuestos por combo.
        </p>
      </div>

      <ComboPricingClient
        combos={combosResult.data}
        pricings={pricingsResult.data}
        margins={marginsResult.data}
        calculations={calculations}
      />
    </div>
  )
}
