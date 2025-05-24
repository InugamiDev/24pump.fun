export default function CoinPageLoading() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        {/* Header Loading */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-6 w-32 animate-pulse rounded-full bg-secondary/10" />
        </div>

        {/* Content Loading */}
        <div className="space-y-6">
          <div>
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-6 w-48 animate-pulse rounded bg-muted" />
          </div>

          {/* Narrative Loading */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-20 w-full animate-pulse rounded bg-muted" />
          </div>

          {/* Social Cause Loading */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2">
              <div className="h-5 w-48 animate-pulse rounded bg-muted mb-2" />
              <div className="h-16 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* Ownership Details Loading */}
          <div className="rounded-lg border bg-card p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-muted mb-4" />
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-4">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex justify-between border-b pb-4">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex justify-between border-b pb-4">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>

          {/* Actions Loading */}
          <div className="flex justify-center gap-4">
            <div className="h-10 w-32 animate-pulse rounded bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}