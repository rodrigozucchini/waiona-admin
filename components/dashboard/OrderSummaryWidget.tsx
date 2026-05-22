import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import { KpiCard } from './KpiCard'
import { formatCurrency } from '@/lib/utils'
import type { OrderAnalytics } from '@/types'

const getOrderAnalytics = unstable_cache(
  (token: string) => api.get<OrderAnalytics>('/analytics/orders', { token }),
  ['analytics-orders'],
  { revalidate: 60, tags: ['analytics'] }
)

export async function OrderSummaryWidget() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value ?? ''
  const data = await getOrderAnalytics(token)

  return (
    <>
      <KpiCard label="Pendientes" value={data.byStatus.pending ?? 0} color="yellow" />
      <KpiCard label="Confirmadas" value={data.byStatus.confirmed ?? 0} color="blue" />
      <KpiCard label="Entregadas" value={data.byStatus.delivered ?? 0} color="green" />
      <KpiCard label="Canceladas" value={data.byStatus.cancelled ?? 0} color="red" />
      <div className="col-span-2 rounded-lg border bg-purple-50 border-purple-200 p-4">
        <p className="text-sm text-purple-800 opacity-70">Ingresos totales</p>
        <p className="mt-1 text-2xl font-bold text-purple-800">
          {formatCurrency(data.totalRevenue)}
        </p>
      </div>
    </>
  )
}
