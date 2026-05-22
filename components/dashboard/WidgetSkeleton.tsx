import { cn } from '@/lib/utils'

export function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-muted', className || 'h-24')} />
  )
}
