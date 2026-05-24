import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { PaginatedResponse, TaxType, Tax } from '@/types'
import { TaxRatesClient } from './TaxRatesClient'

export default async function TaxTypePage({
  params,
}: {
  params: Promise<{ typeId: string }>
}) {
  const { typeId } = await params

  let taxType: TaxType
  try {
    taxType = await api.get<TaxType>(`/tax-types/${typeId}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const taxesResult = await api.get<PaginatedResponse<Tax>>(
    `/tax-types/${typeId}/taxes?limit=100`
  )

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/taxes" className="hover:underline">Impuestos</Link>
          <span>/</span>
          <span className="text-foreground">{taxType.code}</span>
        </nav>
        <h1 className="text-2xl font-semibold">{taxType.name}</h1>
        <p className="text-sm text-muted-foreground font-mono">{taxType.code}</p>
      </div>

      <TaxRatesClient taxTypeId={taxType.id} taxes={taxesResult.data} />
    </div>
  )
}
