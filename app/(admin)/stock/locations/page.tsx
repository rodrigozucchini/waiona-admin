import Link from 'next/link'
import { getStockLocations } from '@/services/stock-location.service'
import { DeleteStockLocationButton } from './DeleteStockLocationButton'

export default async function StockLocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getStockLocations({ page: page ? Number(page) : 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Depósitos</h1>
          <Link href="/stock" className="text-sm underline">
            Volver a stock
          </Link>
        </div>
        <Link href="/stock/locations/new" className="rounded bg-black px-3 py-2 text-white">
          Nuevo depósito
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Tipo</th>
            <th className="py-2">Dirección</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((location) => (
            <tr key={location.id} className="border-b">
              <td className="py-2">{location.name}</td>
              <td className="py-2">{location.type}</td>
              <td className="py-2">{location.address ?? '-'}</td>
              <td className="py-2 text-right">
                <Link href={`/stock/locations/${location.id}`} className="mr-4 text-sm underline">
                  Editar
                </Link>
                <DeleteStockLocationButton id={location.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && (
          <Link href={`/stock/locations?page=${currentPage - 1}`}>Anterior</Link>
        )}
        {currentPage < totalPages && (
          <Link href={`/stock/locations?page=${currentPage + 1}`}>Siguiente</Link>
        )}
      </div>
    </div>
  )
}
