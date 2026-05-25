export default function Loading() {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-9 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
      <div className="space-y-2">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
      <div className="h-9 w-36 animate-pulse rounded bg-muted" />
    </div>
  )
}
