import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopActions } from '@/components/home/top-actions';
import { AIInsightCard } from '@/components/home/ai-insight-card';
import { NutritionCard } from '@/components/home/nutrition-card';
import { StressCheckin } from '@/components/home/stress-checkin';
import { WeeklySnapshot } from '@/components/home/weekly-snapshot';
import { WellnessOrbWidget } from '@/components/home/wellness-orb-widget';
import { GeneratePlanButton } from '@/components/home/generate-plan-button';
import { fallbackInspiration, pickRotatingItems } from '@/lib/content/wellness-content';
import { ObservationTracker } from '@/components/home/observation-tracker';
import { ObservationHistory } from '@/components/home/observation-history';
import { InspireVideoCard } from '@/components/fuel/inspire-video-card';

import { StaggerContainer, FadeUpCard, FadeUp } from '@/components/ui/motion-wrappers';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Wellness Dashboard - FitNexus' };

async function getHomeData(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [profile, latestScore, previousScore, todayHabit, todayInsight, recentInsight, todayMeals, todayActivity] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId } }),
    prisma.wellnessScore.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.wellnessScore.findFirst({ where: { userId, date: { lt: weekAgo } }, orderBy: { date: 'desc' } }),
    prisma.habitLog.findFirst({ where: { userId, date: { gte: today } }, orderBy: { date: 'desc' } }),
    prisma.aIInsight.findFirst({
      where: {
        userId,
        generatedAt: { gte: today },
        modelUsed: { not: 'observation_summary_v1' },
      },
      orderBy: { generatedAt: 'desc' },
    }),
    prisma.aIInsight.findFirst({
      where: {
        userId,
        modelUsed: { not: 'observation_summary_v1' },
      },
      orderBy: { generatedAt: 'desc' },
    }),
    prisma.mealLog.count({
      where: { userId, loggedAt: { gte: today } },
    }),
    prisma.activityLog.aggregate({
      where: { userId, loggedAt: { gte: today } },
      _sum: { durationMin: true },
    }),
  ]);

  return {
    profile,
    latestScore,
    previousScore,
    todayHabit,
    activeInsight: todayInsight ?? recentInsight,
    todayMeals,
    todayActivityMin: todayActivity._sum.durationMin || 0,
  };
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { profile, latestScore, previousScore, todayHabit, activeInsight, todayMeals, todayActivityMin } = await getHomeData(session.user.id);

  // Default actions if no AI insight yet
  const defaultActions = [
    { id: '1', title: 'Take a 20-minute walk', description: 'Get moving with a brisk walk', category: 'movement' as const, completed: false },
    { id: '2', title: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day', category: 'nutrition' as const, completed: false },
    { id: '3', title: '5-minute breathing exercise', description: 'Wind down with deep breaths', category: 'mindfulness' as const, completed: false },
  ];

  // recommendations stores the full AI response: { actions: [...], smartMeal: {...}, ... }
  const recs = activeInsight?.recommendations as Record<string, unknown> | null;
  const actions = Array.isArray(recs?.actions) ? (recs.actions as typeof defaultActions) : defaultActions;

  const insightText = activeInsight?.insightText || 'Welcome to FitNexus! Your personalized insights will appear here as you log more data. Start by completing today\'s actions.';

  // Extract smart meal from AI response
  const aiSmartMeal = recs?.smartMeal as typeof defaultMeal | undefined;

  // Calculate completion rate from actions
  const completionRate = actions.length > 0
    ? Math.round((actions.filter((a) => a.completed).length / actions.length) * 100)
    : 0;

  const currentScore = latestScore?.score || 50;
  const previousScoreVal = previousScore?.score || currentScore;
  const scoreDelta = currentScore - previousScoreVal;

  const defaultMeal = {
    name: 'Mediterranean Quinoa Bowl',
    description: 'A balanced bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing',
    prepTime: '25 min',
    ingredients: ['Quinoa', 'Cherry tomatoes', 'Cucumber', 'Chickpeas', 'Feta', 'Tahini'],
    macroHighlights: '35g protein, 45g carbs',
    dietaryTags: [profile?.dietaryPreference?.replace('_', ' ') || 'Balanced'],
  };

  const smartMeal = aiSmartMeal || defaultMeal;
  const inspireSeed = Number(new Date().toISOString().slice(0, 10).replaceAll('-', ''));
  const inspireItems = pickRotatingItems(fallbackInspiration, inspireSeed, 2);

  return (
    <div className="space-y-8 pb-12">
      <div className="pt-4">
        <h1 className="text-3xl font-bold font-heading tracking-tight gradient-heading drop-shadow-sm">Wellness Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Your daily wellness briefing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StaggerContainer className="space-y-6">
          <FadeUpCard>
            <TopActions actions={actions} planId={activeInsight?.id || 'default'} />
          </FadeUpCard>

          <FadeUp>
            <AIInsightCard insightText={insightText} fallbackUsed={activeInsight?.fallbackUsed ?? true} />
          </FadeUp>

          {profile && (
            <FadeUpCard className="p-0 border-none blur-none bg-transparent shadow-none">
              <GeneratePlanButton hasExistingPlan={!!activeInsight} />
            </FadeUpCard>
          )}

          <FadeUpCard>
            <NutritionCard smartMeal={smartMeal} dietaryPreference={profile?.dietaryPreference || 'BALANCED'} />
          </FadeUpCard>
        </StaggerContainer>

        <StaggerContainer className="space-y-6">
          <FadeUpCard className="overflow-hidden shadow-glow">
            <WellnessOrbWidget score={currentScore} />
          </FadeUpCard>

          <FadeUpCard>
            <WeeklySnapshot completionRate={completionRate} scoreDelta={scoreDelta} currentScore={currentScore} />
          </FadeUpCard>

          <FadeUpCard>
            <StressCheckin currentStress={todayHabit?.stressLevel} preserveMode={todayHabit?.isRecoveryDay ?? false} />
          </FadeUpCard>

          <FadeUpCard>
            <div className="space-y-3">
              <h3 className="text-sm text-primary font-semibold tracking-wide uppercase font-heading">Inspire Me</h3>
              <p className="text-xs text-muted-foreground">
                Quick mindset and movement clips aligned with your day.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {inspireItems.map((item) => (
                  <InspireVideoCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </FadeUpCard>

          <FadeUpCard>
            <ObservationTracker
              userId={session.user.id}
              defaultFoodEntries={todayMeals}
              defaultActivityMinutes={todayActivityMin}
              defaultSleepHours={todayHabit?.sleepHours ?? 7}
              defaultStressLevel={todayHabit?.stressLevel ?? 3}
              defaultWaterLiters={todayHabit?.hydrationLiters ?? 1.5}
            />
          </FadeUpCard>

          <FadeUpCard>
            <ObservationHistory />
          </FadeUpCard>
        </StaggerContainer>
      </div>
    </div>
  );
}
