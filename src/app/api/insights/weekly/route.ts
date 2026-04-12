import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOpenAI, MODEL } from '@/lib/ai/openai-client';
import { buildWeeklySummaryPrompt, WEEKLY_PROMPT_VERSION } from '@/lib/ai/prompts';
import { buildAIContext } from '@/lib/ai/context-builder';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitByUser } from '@/lib/rate-limit';

/**
 * GET /api/insights/weekly
 * Retrieve the most recent weekly summary.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const summary = await prisma.aIInsight.findFirst({
      where: { userId: session.user.id, weeklyFocus: { not: null } },
      orderBy: { generatedAt: 'desc' },
    });

    return NextResponse.json({ summary });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/insights/weekly
 * Generate a new weekly wellness summary using AI.
 * Rate limited to 1 generation per day.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    // Rate limit: 1 weekly summary per day
    const { success } = rateLimitByUser(session.user.id, 'weekly-summary', 1, 24 * 60 * 60 * 1000);
    if (!success) throw new ApiError(429, 'Weekly summary can only be generated once per day');

    const context = await buildAIContext(session.user.id);

    // Calculate weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const latestPlan = await prisma.mealPlan.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        calorieTarget: true,
        proteinTargetG: true,
        fallbackUsed: true,
        createdAt: true,
      },
    });
    const nutritionHint = latestPlan
      ? `Latest meal plan targets ~${Math.round(latestPlan.calorieTarget)} kcal/day, protein ~${Math.round(latestPlan.proteinTargetG)}g (generated ${latestPlan.createdAt.toISOString().slice(0, 10)}, fallback=${latestPlan.fallbackUsed}).`
      : null;

    const [insights, scores] = await Promise.all([
      prisma.aIInsight.findMany({
        where: {
          userId: session.user.id,
          generatedAt: { gte: weekAgo },
          weeklyFocus: null,
          modelUsed: { not: 'observation_summary_v1' },
        },
      }),
      prisma.wellnessScore.findMany({
        where: { userId: session.user.id, date: { gte: weekAgo } },
      }),
    ]);

    // Calculate completion rate from stored daily plan actions
    let totalActions = 0;
    let completedActions = 0;
    for (const insight of insights) {
      const recs = insight.recommendations as Record<string, unknown> | null;
      if (recs && Array.isArray(recs)) {
        for (const item of recs) {
          if (typeof item === 'object' && item !== null) {
            totalActions++;
            if ((item as { completed?: boolean }).completed) completedActions++;
          }
        }
      } else if (recs && typeof recs === 'object' && 'actions' in recs && Array.isArray(recs.actions)) {
        for (const action of recs.actions as { completed?: boolean }[]) {
          totalActions++;
          if (action.completed) completedActions++;
        }
      }
    }

    const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
    const avgScore = scores.length
      ? scores.reduce((sum: number, s: { score: number }) => sum + s.score, 0) / scores.length
      : 50;

    const prompt = buildWeeklySummaryPrompt({
      ...context,
      weeklyStats: { completionRate, avgScore },
      nutritionHint,
    });

    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new ApiError(500, 'Empty AI response');

    const parsed = JSON.parse(content);

    const stored = await prisma.aIInsight.create({
      data: {
        userId: session.user.id,
        insightText: parsed.summary || '',
        recommendations: JSON.parse(JSON.stringify(parsed)),
        weeklyFocus: parsed.weeklyFocus || null,
        fallbackUsed: false,
        promptVersion: WEEKLY_PROMPT_VERSION,
        modelUsed: MODEL,
        contextHash: null,
      },
    });

    return NextResponse.json({ summary: stored }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
