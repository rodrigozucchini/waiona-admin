# Analytics Dashboard

The dashboard is the first page an admin sees. It aggregates three analytics endpoints into an actionable overview. Data is fetched in parallel with streaming via Suspense.

---

## 1. Available Endpoints

```
GET /analytics/orders
→ {
    summary: { [status: OrderStatus]: number },
    revenue: { total: number, byStatus: { [status]: number } }
  }

GET /analytics/products/top
→ {
    topProducts: Array<{
      productId: string
      productName: string
      totalSold: number
      totalRevenue: number
    }>
  }

GET /analytics/stock/critical
→ {
    criticalItems: Array<{
      stockItemId: string
      productName: string
      locationName: string
      available: number
      criticalThreshold: number
    }>
  }
```

---

## 2. Dashboard Page — Parallel Streaming

Use independent Suspense boundaries so each widget loads independently:

```typescript
// app/(admin)/dashboard/page.tsx
import { Suspense } from 'react'
import { OrderSummaryWidget } from '@/components/dashboard/OrderSummaryWidget'
import { TopProductsWidget } from '@/components/dashboard/TopProductsWidget'
import { CriticalStockWidget } from '@/components/dashboard/CriticalStockWidget'
import { WidgetSkeleton } from '@/components/dashboard/WidgetSkeleton'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <Suspense fallback={<WidgetSkeleton />}>
          <OrderSummaryWidget />
        </Suspense>
      </div>

      {/* Charts and lists */}
      <div className="grid grid-cols-2 gap-6">
        <Suspense fallback={<WidgetSkeleton className="h-64" />}>
          <TopProductsWidget />
        </Suspense>

        <Suspense fallback={<WidgetSkeleton className="h-64" />}>
          <CriticalStockWidget />
        </Suspense>
      </div>
    </div>
  )
}
```

---

## 3. Widgets as Async Server Components

Each widget is an independent async Server Component that fetches its own data:

```typescript
// components/dashboard/OrderSummaryWidget.tsx
import { api } from '@/lib/api'

interface OrderAnalytics {
  summary: Record<string, number>
  revenue: { total: number; byStatus: Record<string, number> }
}

export async function OrderSummaryWidget() {
  const data = await api.get<OrderAnalytics>('/analytics/orders')

  const cards = [
    { label: 'Pendientes', value: data.summary.pending ?? 0, color: 'yellow' },
    { label: 'Confirmadas', value: data.summary.confirmed ?? 0, color: 'blue' },
    { label: 'Entregadas', value: data.summary.delivered ?? 0, color: 'green' },
    { label: 'Canceladas', value: data.summary.cancelled ?? 0, color: 'red' },
  ]

  return (
    <>
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
      <KpiCard
        label="Ingresos totales"
        value={`$${data.revenue.total.toLocaleString('es-AR')}`}
        color="purple"
        span={2}
      />
    </>
  )
}
```

```typescript
// components/dashboard/TopProductsWidget.tsx
import { api } from '@/lib/api'

interface TopProductsData {
  topProducts: Array<{
    productId: string
    productName: string
    totalSold: number
    totalRevenue: number
  }>
}

export async function TopProductsWidget() {
  const data = await api.get<TopProductsData>('/analytics/products/top')

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-4 font-medium">Top 10 Productos</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left">Producto</th>
            <th className="text-right">Vendidos</th>
            <th className="text-right">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          {data.topProducts.map((item, i) => (
            <tr key={item.productId} className="border-t">
              <td>
                <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                {item.productName}
              </td>
              <td className="text-right">{item.totalSold}</td>
              <td className="text-right">
                ${item.totalRevenue.toLocaleString('es-AR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

```typescript
// components/dashboard/CriticalStockWidget.tsx
import { api } from '@/lib/api'
import Link from 'next/link'

interface CriticalStockData {
  criticalItems: Array<{
    stockItemId: string
    productName: string
    locationName: string
    available: number
    criticalThreshold: number
  }>
}

export async function CriticalStockWidget() {
  const data = await api.get<CriticalStockData>('/analytics/stock/critical')

  if (data.criticalItems.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-medium">Stock Crítico</h2>
        <p className="text-sm text-muted-foreground">
          Todo el stock está sobre los umbrales críticos.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="mb-4 font-medium text-red-800">
        ⚠ Stock Crítico ({data.criticalItems.length})
      </h2>
      <ul className="space-y-2">
        {data.criticalItems.map((item) => (
          <li key={item.stockItemId} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">{item.locationName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-700">{item.available} u.</p>
              <Link
                href={`/stock/items/${item.stockItemId}`}
                className="text-xs underline"
              >
                Ver stock
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 4. KPI Card Component

```typescript
// components/dashboard/KpiCard.tsx
interface Props {
  label: string
  value: string | number
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple'
  span?: number
}

const colorMap = {
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  green: 'bg-green-50 border-green-200 text-green-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
}

export function KpiCard({ label, value, color, span = 1 }: Props) {
  return (
    <div
      className={`rounded-lg border p-4 ${colorMap[color]}`}
      style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}
    >
      <p className="text-sm opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
```

---

## 5. Widget Skeleton

```typescript
// components/dashboard/WidgetSkeleton.tsx
export function WidgetSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className || 'h-24'}`} />
  )
}
```

---

## 6. Dashboard loading.tsx

The `loading.tsx` is a fallback for the whole page, but individual Suspense boundaries provide more granular streaming:

```typescript
// app/(admin)/dashboard/loading.tsx
import { WidgetSkeleton } from '@/components/dashboard/WidgetSkeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <WidgetSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <WidgetSkeleton className="h-64" />
        <WidgetSkeleton className="h-64" />
      </div>
    </div>
  )
}
```

---

## 7. Data Freshness

Analytics data does not need to be real-time. Cache with a short TTL:

```typescript
// In each widget, wrap the fetch with unstable_cache
import { unstable_cache } from 'next/cache'

const getOrderAnalytics = unstable_cache(
  () => api.get<OrderAnalytics>('/analytics/orders'),
  ['analytics-orders'],
  { revalidate: 60, tags: ['analytics'] } // revalidate every 60 seconds
)
```

Call `revalidateTag('analytics')` when an order status is updated.

---

## 8. Rules

- Each widget is an independent async Server Component — never combine into one large fetch.
- Wrap each widget in its own `<Suspense>` so failures or slowness in one don't block others.
- Never use polling (`setInterval`) for dashboard data — use ISR (`revalidate`) instead.
- The critical stock widget is the most important: highlight it prominently and link directly to the stock item.
- Format currency with `toLocaleString('es-AR')` for Argentine pesos.
