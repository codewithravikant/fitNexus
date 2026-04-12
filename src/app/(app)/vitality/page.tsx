import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MovementPlan } from '@/components/vitality/movement-plan';
import { ActivityPreview } from '@/components/vitality/activity-preview';
import { LogActivityDialog } from '@/components/vitality/log-activity-dialog';
import { DailyCheckin } from '@/components/vitality/daily-checkin';
import { HabitStreaks } from '@/components/charts/habit-streaks';
import { StaggerContainer, FadeUpCard } from '@/components/ui/motion-wrappers';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vitality - FitNexus' };

export default async function VitalityPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [profile, activities, todayHabit, recentHabits] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.activityLog.findMany({
      where: { userId: session.user.id, loggedAt: { gte: sixMonthsAgo } },
      orderBy: { loggedAt: 'desc' },
    }),
    prisma.habitLog.findFirst({
      where: { userId: session.user.id, date: { gte: today } },
    }),
    // Last 30 days of habit logs for streak calculation
    prisma.habitLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 30,
      select: { date: true },
    }),
  ]);

  // Build streak data: array of last 30 days, newest first
  const streakData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const logged = recentHabits.some((h: { date: Date }) => {
      const hd = new Date(h.date);
      return (
        hd.getFullYear() === d.getFullYear() &&
        hd.getMonth() === d.getMonth() &&
        hd.getDate() === d.getDate()
      );
    });
    return { date: dateStr, logged };
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-heading drop-shadow-sm">Vitality</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Movement &amp; activity</p>
        </div>
        <LogActivityDialog />
      </div>

      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FadeUpCard className="h-full p-0 bg-transparent border-none shadow-none">
            <DailyCheckin
              existing={
                todayHabit
                  ? {
                    sleepHours: todayHabit.sleepHours,
                    sleepQuality: todayHabit.sleepQuality,
                    hydrationLiters: todayHabit.hydrationLiters,
                    stressLevel: todayHabit.stressLevel,
                    moodLevel: todayHabit.moodLevel,
                    isRecoveryDay: todayHabit.isRecoveryDay,
                    notes: todayHabit.notes,
                  }
                  : null
              }
            />
          </FadeUpCard>
        </div>

        <FadeUpCard className="h-full">
          <HabitStreaks data={streakData} />
        </FadeUpCard>
      </StaggerContainer>

      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FadeUpCard className="h-full">
          <MovementPlan
            fitnessLevel={profile?.fitnessLevel || 'INTERMEDIATE'}
            preferredEnvironment={profile?.preferredEnvironment || 'MIXED'}
            preserveMode={todayHabit?.isRecoveryDay ?? false}
          />
        </FadeUpCard>
        <FadeUpCard className="h-full">
          <ActivityPreview
            activities={activities.map((a: { id: string; activityType: string; durationMin: number; intensityLevel: string | null; loggedAt: Date }) => ({
              id: a.id,
              activityType: a.activityType,
              durationMin: a.durationMin,
              intensityLevel: a.intensityLevel,
              loggedAt: a.loggedAt.toISOString(),
            }))}
          />
        </FadeUpCard>
      </StaggerContainer>
    </div>
  );
}
