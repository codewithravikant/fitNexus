export default function FuelLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div className="h-8 w-32 rounded bg-muted animate-pulse" />
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-48 rounded bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
