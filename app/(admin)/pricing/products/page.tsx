import { api } from '@/lib/api'
import type { PaginatedResponse, Product, Margin, ProductPricing } from '@/types'
import { ProductPricingClient } from './ProductPricingClient'

export default async function ProductPricingPage() {
  const [productsResult, pricingsResult, marginsResult] = await Promise.all([
    api.get<PaginatedResponse<Product>>('/products?limit=200'),
    api.get<PaginatedResponse<ProductPricing>>('/product-pricing?limit=200'),
    api.get<PaginatedResponse<Margin>>('/margins?limit=100'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Precios de productos</h1>
        <p className="text-sm text-muted-foreground">
          Precio base por producto y moneda, con margen opcional.
        </p>
      </div>

      <ProductPricingClient
        products={productsResult.data}
        pricings={pricingsResult.data}
        margins={marginsResult.data}
      />
    </div>
  )
}
