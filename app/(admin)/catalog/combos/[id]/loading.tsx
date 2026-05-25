export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-9 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="h-48 animate-pulse rounded-lg border bg-muted" />
      </div>
    </div>
  )
}
