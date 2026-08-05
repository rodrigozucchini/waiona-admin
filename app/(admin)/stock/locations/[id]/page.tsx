import { notFound } from 'next/navigation'
import { getStockLocation } from '@/services/stock-location.service'
import { ApiError } from '@/core/lib/api'
import { StockLocationForm } from '../StockLocationForm'

export default async function EditStockLocationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const location = await getStockLocation(Number(id)).catch((error) => {
    if (error instanceof ApiError && error.statusCode === 404) notFound()
    throw error
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Editar depósito</h1>
      <StockLocationForm location={location} />
    </div>
  )
}
