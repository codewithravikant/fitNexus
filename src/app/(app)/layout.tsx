import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SidebarNav } from '@/components/app/sidebar-nav';
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
    <div className="min-h-screen bg-background relative nature-ambient">
      <SidebarNav />
      <main className="ml-60 min-h-screen relative z-10">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
      <FloatingActionButton />
    </div>
  );
}
