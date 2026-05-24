import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import type { TopProductItem } from '@/types'

const getTopProducts = unstable_cache(
  (token: string) => api.get<TopProductItem[]>('/analytics/products/top', { token }),
  ['analytics-top-products'],
  { revalidate: 60, tags: ['analytics'] }
)

export async function TopProductsWidget() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value ?? ''
  const data = await getTopProducts(token)

  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-medium">Top 10 Productos</h2>
        <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-4 font-medium">Top 10 Productos</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left font-normal">Producto</th>
            <th className="text-right font-normal">Vendidos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={item.productId} className="border-t">
              <td className="py-1.5">
                <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                {item.name}
              </td>
              <td className="py-1.5 text-right">{item.totalSold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
