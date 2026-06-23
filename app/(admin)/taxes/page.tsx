import { api } from '@/lib/api'
import { TaxTypesClient } from './TaxTypesClient'
import type { PaginatedResponse, TaxType } from '@/types'

export default async function TaxesPage() {
  const taxTypes = await api.get<PaginatedResponse<TaxType>>('/tax-types?limit=100').then((r) => r.data)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Impuestos</h1>
        <p className="text-sm text-muted-foreground">
          Tipos de impuesto y sus tasas por moneda.
        </p>
      </div>

      <TaxTypesClient taxTypes={taxTypes} />
    </div>
  )
}
