import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, TaxType } from '@/types'
import { TaxTypesClient } from './TaxTypesClient'

export default async function TaxesPage() {
  const result = await api.get<PaginatedResponse<TaxType>>('/tax-types?limit=100')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Impuestos</h1>
        <p className="text-sm text-muted-foreground">
          Tipos de impuesto y sus tasas por moneda.
        </p>
      </div>

      <TaxTypesClient taxTypes={result.data} />
    </div>
  )
}
