export default function Loading() {
  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-1">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-52 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-9 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
      <div className="h-9 w-40 animate-pulse rounded bg-muted" />
    </div>
  )
}
