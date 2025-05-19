export function CoinSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Date Circle Skeleton */}
          <div className="h-12 w-12 rounded-full bg-muted" />
          
          {/* Content Skeleton */}
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-md bg-muted" />
            <div className="h-4 w-48 rounded-md bg-muted" />
            <div className="h-4 w-64 rounded-md bg-muted" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex shrink-0 gap-2">
          <div className="hidden h-8 w-32 rounded-md bg-muted sm:block" />
          <div className="h-8 w-20 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function CoinGridSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm animate-pulse">
      {/* Date Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded-md bg-muted" />
            <div className="h-3 w-20 rounded-md bg-muted" />
          </div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full rounded-md bg-muted" />
        <div className="h-4 w-3/4 rounded-md bg-muted" />
      </div>

      {/* Actions Skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-full rounded-md bg-muted" />
        <div className="h-8 w-full rounded-md bg-muted" />
      </div>
    </div>
  )
}