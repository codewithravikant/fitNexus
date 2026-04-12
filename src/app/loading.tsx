import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading FitNexus...</p>
      </div>
    </div>
  );
}
