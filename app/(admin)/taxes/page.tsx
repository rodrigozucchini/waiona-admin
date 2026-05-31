import { getTaxTypes } from '@/lib/cache'
import { TaxTypesClient } from './TaxTypesClient'

export default async function TaxesPage() {
  const taxTypes = await getTaxTypes()

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
