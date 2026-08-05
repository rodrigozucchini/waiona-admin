import Link from 'next/link'
import { getStockItems } from '@/services/stock-item.service'

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getStockItems({ page: page ? Number(page) : 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stock</h1>
          <Link href="/stock/locations" className="text-sm underline">
            Depósitos
          </Link>
        </div>
        <Link href="/stock/new" className="rounded bg-black px-3 py-2 text-white">
          Nuevo item
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Producto</th>
            <th className="py-2">Depósito</th>
            <th className="py-2">Actual</th>
            <th className="py-2">Reservado</th>
            <th className="py-2">Disponible</th>
            <th className="py-2">Mín. / Crítico</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const isCritical = item.quantityAvailable <= item.stockCritical
            const isLow = !isCritical && item.quantityAvailable <= item.stockMin
            return (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.productName}</td>
                <td className="py-2">{item.locationName}</td>
                <td className="py-2">{item.quantityCurrent}</td>
                <td className="py-2">{item.quantityReserved}</td>
                <td
                  className={`py-2 ${isCritical ? 'font-semibold text-red-600' : isLow ? 'font-semibold text-amber-600' : ''}`}
                >
                  {item.quantityAvailable}
                </td>
                <td className="py-2">
                  {item.stockMin} / {item.stockCritical}
                </td>
                <td className="py-2 text-right">
                  <Link href={`/stock/${item.id}`} className="text-sm underline">
                    Ver
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && <Link href={`/stock?page=${currentPage - 1}`}>Anterior</Link>}
        {currentPage < totalPages && <Link href={`/stock?page=${currentPage + 1}`}>Siguiente</Link>}
      </div>
    </div>
  )
}
