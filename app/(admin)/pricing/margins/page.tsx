import { getMargins } from '@/lib/cache'
import { MarginsClient } from './MarginsClient'

export default async function MarginsPage() {
  const margins = await getMargins()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Márgenes</h1>
        <p className="text-sm text-muted-foreground">
          Porcentajes de margen aplicados sobre el precio base.
        </p>
      </div>

      <MarginsClient margins={margins} />
    </div>
  )
}
