export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
          <div className="rounded-lg border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b px-4 py-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
