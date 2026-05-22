import { Suspense } from 'react'
import { OrderSummaryWidget } from '@/components/dashboard/OrderSummaryWidget'
import { TopProductsWidget } from '@/components/dashboard/TopProductsWidget'
import { CriticalStockWidget } from '@/components/dashboard/CriticalStockWidget'
import { WidgetSkeleton } from '@/components/dashboard/WidgetSkeleton'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Suspense
          fallback={
            <>
              <WidgetSkeleton />
              <WidgetSkeleton />
              <WidgetSkeleton />
              <WidgetSkeleton />
              <div className="col-span-2">
                <WidgetSkeleton className="h-16" />
              </div>
            </>
          }
        >
          <OrderSummaryWidget />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
