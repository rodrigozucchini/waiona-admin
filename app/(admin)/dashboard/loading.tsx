import { WidgetSkeleton } from '@/components/dashboard/WidgetSkeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WidgetSkeleton className="h-64" />
        <WidgetSkeleton className="h-64" />
      </div>
    </div>
  )
}
