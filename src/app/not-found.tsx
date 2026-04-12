import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Leaf className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/home">
            <Button variant="outline">Wellness Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
