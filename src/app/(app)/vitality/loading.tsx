export default function VitalityLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div className="h-8 w-32 rounded bg-muted animate-pulse" />
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-48 rounded bg-muted animate-pulse" />
        <div className="h-20 w-full rounded bg-muted animate-pulse" />
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-16 flex-1 rounded bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
