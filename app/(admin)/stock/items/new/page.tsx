import { api } from '@/lib/api'
import Link from 'next/link'
import { getStockLocations } from '@/lib/cache'
import type { PaginatedResponse, Product } from '@/types'
import { NewStockItemForm } from './NewStockItemForm'

export default async function NewStockItemPage() {
  const [products, locations] = await Promise.all([
    api.get<PaginatedResponse<Product>>('/products?limit=200'),
    getStockLocations(),
  ])

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/stock/items" className="hover:underline">Stock</Link>
          <span>/</span>
          <span className="text-foreground">Nuevo ítem</span>
        </nav>
        <h1 className="text-2xl font-semibold">Nuevo ítem de stock</h1>
        <p className="text-sm text-muted-foreground">
          Asociá un producto a una ubicación. El stock inicial queda en 0.
        </p>
      </div>
      <NewStockItemForm products={products.data} locations={locations} />
    </div>
  )
}
