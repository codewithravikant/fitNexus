export default function BlueprintLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div className="h-8 w-36 rounded bg-muted animate-pulse" />
      {/* Wellness score gauge skeleton */}
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center space-y-3">
        <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
        <div className="h-5 w-24 rounded bg-muted animate-pulse" />
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            <div className="h-6 w-12 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="rounded-xl border bg-card p-6">
        <div className="h-5 w-40 rounded bg-muted animate-pulse mb-4" />
        <div className="h-48 w-full rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
