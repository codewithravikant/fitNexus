import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogWeightDialog } from '@/components/blueprint/log-weight-dialog';
import { WeightTrend } from '@/components/charts/weight-trend';
import Link from 'next/link';
import { User, Shield, Download, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StaggerContainer, FadeUpCard } from '@/components/ui/motion-wrappers';
import { calculateBMI } from '@/lib/calculations';
import { recalculateAndStoreWellnessScore } from '@/lib/wellness-score';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blueprint - FitNexus' };

export default async function BlueprintPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [profile, scores, weightLogs] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.wellnessScore.findMany({ where: { userId: session.user.id }, orderBy: { date: 'desc' }, take: 30 }),
    prisma.weightLog.findMany({ where: { userId: session.user.id }, orderBy: { loggedAt: 'desc' }, take: 30 }),
  ]);

  let latestScore = scores[0];
  if (profile) {
    const expectedBmi = calculateBMI(profile.heightCm, profile.weightKg);
    const staleScore =
      !latestScore
      || Math.abs((latestScore.bmi ?? 0) - expectedBmi) > 0.5
      || Math.abs((latestScore.weightKg ?? profile.weightKg) - profile.weightKg) > 0.01;

    if (staleScore) {
      latestScore = await recalculateAndStoreWellnessScore(session.user.id);
    }
  }
  const bmi = latestScore?.bmi;
  const bmiCategory = latestScore?.bmiCategory;

  return (
    <div className="space-y-8 pb-12">
      <div className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight gradient-heading drop-shadow-sm">Blueprint</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Your progress dashboard</p>
      </div>

      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <FadeUpCard className="lg:col-span-2 p-0 bg-transparent border-none shadow-none h-full">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-emerald-400">Wellness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="absolute inset-0" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-emerald-900/40" />
                    <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="8"
                      strokeDasharray={`${((latestScore?.score || 50) / 100) * 339} 339`}
                      strokeLinecap="round" className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" transform="rotate(-90 64 64)" />
                  </svg>
                  <span className="text-3xl font-bold text-glow">{Math.round(latestScore?.score || 50)}</span>
                </div>
                {latestScore && (
                  <div className="grid grid-cols-4 gap-4 flex-1 w-full">
                    <div className="rounded-lg bg-black/40 border border-emerald-500/10 p-3 text-center shadow-inner">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Habits</p>
                      <p className="font-bold text-xl text-emerald-50 mt-1">{Math.round(latestScore.habitsScore)}</p>
                    </div>
                    <div className="rounded-lg bg-black/40 border border-emerald-500/10 p-3 text-center shadow-inner">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Activity</p>
                      <p className="font-bold text-xl text-emerald-50 mt-1">{Math.round(latestScore.activityScore)}</p>
                    </div>
                    <div className="rounded-lg bg-black/40 border border-emerald-500/10 p-3 text-center shadow-inner">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Progress</p>
                      <p className="font-bold text-xl text-emerald-50 mt-1">{Math.round(latestScore.progressScore)}</p>
                    </div>
                    <div className="rounded-lg bg-black/40 border border-emerald-500/10 p-3 text-center shadow-inner">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">BMI</p>
                      <p className="font-bold text-xl text-emerald-50 mt-1">{Math.round(latestScore.bmiScore)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeUpCard>

        <FadeUpCard className="h-full p-0 bg-transparent border-none shadow-none">
          <Card className="h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-emerald-400">Weight</CardTitle>
                <LogWeightDialog currentWeight={profile?.weightKg} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-4xl font-bold text-glow">{profile?.weightKg?.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">kg</span></p>
              {weightLogs.length > 1 && (
                <p className="text-sm text-emerald-500/70 mt-4">
                  {weightLogs.length} entries carefully tracked
                </p>
              )}
            </CardContent>
          </Card>
        </FadeUpCard>
      </StaggerContainer>

      {/* Weight Trend Chart */}
      {weightLogs.length > 0 && (
        <FadeUpCard className="p-0 border-none bg-transparent shadow-none">
          <WeightTrend
            data={weightLogs.map((w: { loggedAt: Date; weightKg: number }) => ({
              date: w.loggedAt.toISOString(),
              weight: w.weightKg,
            }))}
            targetWeight={profile?.targetWeightKg ?? undefined}
          />
        </FadeUpCard>
      )}

      {/* BMI + Quick Links row */}
      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {bmi && (
          <FadeUpCard className="lg:col-span-2 p-0 bg-transparent border-none shadow-none h-full">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-emerald-400">Body Mass Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-6 mt-2">
                  <div>
                    <p className="text-4xl font-bold text-glow">{bmi.toFixed(1)}</p>
                    <p className="text-sm text-emerald-400/80 uppercase tracking-wide mt-1">{bmiCategory}</p>
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 relative overflow-hidden">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-5 rounded-md bg-white border-2 border-background shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                      style={{ left: `${Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeUpCard>
        )}

        {/* Quick Links */}
        <div className={cn('grid grid-cols-2 gap-4', !bmi && 'lg:col-span-3 grid-cols-4')}>
          <Link href="/blueprint/profile" className="block">
            <Card className="p-4 text-center border-emerald-500/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer h-full flex flex-col items-center justify-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              <User className="h-8 w-8 mx-auto text-emerald-400 group-hover:scale-110 transition-transform" />
              <p className="text-sm mt-3 font-medium">Profile</p>
            </Card>
          </Link>
          <Link href="/blueprint/profile#sign-in" className="block">
            <Card className="p-4 text-center border-emerald-500/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer h-full flex flex-col items-center justify-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              <Lock className="h-8 w-8 mx-auto text-emerald-400 group-hover:scale-110 transition-transform" />
              <p className="text-sm mt-3 font-medium">Security</p>
            </Card>
          </Link>
          <Link href="/blueprint/privacy" className="block">
            <Card className="p-4 text-center border-emerald-500/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer h-full flex flex-col items-center justify-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="h-8 w-8 mx-auto text-emerald-400 group-hover:scale-110 transition-transform" />
              <p className="text-sm mt-3 font-medium">Privacy</p>
            </Card>
          </Link>
          <Link href="/blueprint/export" className="block">
            <Card className="p-4 text-center border-emerald-500/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer h-full flex flex-col items-center justify-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              <Download className="h-8 w-8 mx-auto text-emerald-400 group-hover:scale-110 transition-transform" />
              <p className="text-sm mt-3 font-medium">Export</p>
            </Card>
          </Link>
        </div>
      </StaggerContainer>
    </div>
  );
}
