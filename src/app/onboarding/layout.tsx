import { Leaf } from 'lucide-react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col items-center justify-center">
      {/* Ambient glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl px-6 py-12 relative z-10">
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold gradient-text">FitNexus</span>
        </div>
        {children}
      </div>
    </div>
  );
}
