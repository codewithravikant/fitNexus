import { Leaf } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-mesh nature-ambient p-4">
      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_0_30px_rgba(52,211,153,0.3)]">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-heading gradient-text">FitNexus</h1>
          <p className="text-sm text-muted-foreground">Your AI wellness coach</p>
        </div>
        {children}
      </div>
    </div>
  );
}
