export default function CreatePageLoading() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}