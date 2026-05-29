import { api } from '@/lib/api'
import type { PaginatedResponse, Product, Margin, ProductPricing, PriceBreakdown } from '@/types'
import { ProductPricingClient } from './ProductPricingClient'

export default async function ProductPricingPage() {
  const [productsResult, pricingsResult, marginsResult] = await Promise.all([
    api.get<PaginatedResponse<Product>>('/products?limit=100'),
    api.get<PaginatedResponse<ProductPricing>>('/product-pricing?limit=100'),
    api.get<PaginatedResponse<Margin>>('/margins?limit=100'),
  ])

  // Fetch full price breakdown for every priced product in parallel
  const calcResults = await Promise.allSettled(
    pricingsResult.data.map((p) =>
      api.post<PriceBreakdown>('/pricing/calculate/product', { productId: p.productId })
    )
  )

  const calculations: Record<number, PriceBreakdown> = {}
  pricingsResult.data.forEach((p, i) => {
    const r = calcResults[i]
    if (r.status === 'fulfilled') calculations[p.productId] = r.value
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Precios de productos</h1>
        <p className="text-sm text-muted-foreground">
          Precio base, margen e impuestos por producto.
        </p>
      </div>

      <ProductPricingClient
        products={productsResult.data}
        pricings={pricingsResult.data}
        margins={marginsResult.data}
        calculations={calculations}
      />
    </div>
  )
}
