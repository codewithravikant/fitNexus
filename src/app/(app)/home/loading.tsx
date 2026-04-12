import { Card, CardContent, CardHeader } from '@/components/ui/card';

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 w-40 rounded bg-muted animate-pulse-soft" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 w-full rounded bg-muted animate-pulse-soft" />
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse-soft" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse-soft" />
      </CardContent>
    </Card>
  );
}

export default function HomeLoading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-6 w-40 rounded bg-muted animate-pulse-soft" />
        <div className="mt-1 h-4 w-56 rounded bg-muted animate-pulse-soft" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
