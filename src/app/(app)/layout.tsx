import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SidebarNav } from '@/components/app/sidebar-nav';
import { BottomNav } from '@/components/app/bottom-nav';
import { FloatingActionButton } from '@/components/app/floating-action-button';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const profile = await prisma.healthProfile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (!profile?.onboardingCompleted) redirect('/onboarding');

  return (
    <div className="relative min-h-screen bg-background nature-ambient">
      <SidebarNav />
      <main className="relative z-10 ml-0 min-h-screen pt-14 pb-24 transition-[margin] duration-200 ease-out md:ml-[var(--sidebar-width)] md:pt-0 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</div>
      </main>
      <BottomNav />
      <FloatingActionButton />
    </div>
  );
}
