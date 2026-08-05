import { getProducts } from '@/services/product.service'
import { getStockLocations } from '@/services/stock-location.service'
import { StockItemForm } from '../StockItemForm'

export default async function NewStockItemPage() {
  const [{ data: products }, { data: locations }] = await Promise.all([
    getProducts({ limit: 100 }),
    getStockLocations({ limit: 100 }),
  ])

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Nuevo item de stock</h1>
      <StockItemForm products={products} locations={locations} />
    </div>
  )
}
