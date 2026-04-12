import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';
import { generateDailyPlan } from '@/lib/ai/insight-generator';
import type { DailyAction } from '@/types/ai';

const AUTO_ACTION_NOTE_PREFIX = 'top-action:';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const insight = await prisma.aIInsight.findFirst({
      where: {
        userId: session.user.id,
        generatedAt: { gte: today },
        modelUsed: { not: 'observation_summary_v1' },
      },
      orderBy: { generatedAt: 'desc' },
    });

    if (!insight) {
      return NextResponse.json({
        plan: null,
        message: 'No plan generated for today yet',
      });
    }

    return NextResponse.json({ plan: insight });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const body = await request.json().catch(() => ({}));

    // If no action payload, generate a new plan (and return cached plan if AI is down).
    if (!body?.planId && !body?.actionId) {
      const preserveMode = body?.preserveMode ?? false;
      const plan = await generateDailyPlan(session.user.id, preserveMode);
      return NextResponse.json(plan, { status: 201 });
    }

    const { planId, actionId, completed } = body;

    if (!planId || !actionId) {
      throw new ApiError(400, 'planId and actionId are required');
    }
    if (typeof completed !== 'boolean') {
      throw new ApiError(400, 'completed must be a boolean');
    }

    // A default client-side plan cannot be persisted safely.
    if (planId === 'default') {
      throw new ApiError(409, 'Please generate today\'s plan before marking actions complete.');
    }

    const insight = await prisma.aIInsight.findFirst({
      where: { id: planId, userId: session.user.id },
    });

    if (!insight) throw new ApiError(404, 'Plan not found');

    const recommendations = (insight.recommendations as Record<string, unknown>) || {};
    const actions = Array.isArray(recommendations.actions) ? (recommendations.actions as DailyAction[]) : [];
    if (!actions.length) throw new ApiError(400, 'No actions found on this plan');

    const existing = actions.find((a) => a.id === actionId);
    if (!existing) throw new ApiError(404, 'Action not found');

    if (existing.completed && completed) {
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }
    if (existing.completed && !completed) {
      throw new ApiError(409, 'Completed actions stay locked for the day.');
    }

    const nowIso = new Date().toISOString();
    const updatedActions = actions.map((action) =>
      action.id === actionId
        ? {
            ...action,
            completed,
            completedAt: completed ? action.completedAt ?? nowIso : undefined,
          }
        : action
    );

    await prisma.aIInsight.update({
      where: { id: planId },
      data: {
        recommendations: JSON.parse(
          JSON.stringify({
            ...recommendations,
            actions: updatedActions,
          })
        ),
      },
    });

    if (completed) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const autoNote = `${AUTO_ACTION_NOTE_PREFIX}${actionId}`;

      const existingLog = await prisma.activityLog.findFirst({
        where: {
          userId: session.user.id,
          loggedAt: { gte: today },
          notes: autoNote,
        },
      });

      if (!existingLog) {
        const updatedAction = updatedActions.find((a) => a.id === actionId);
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            activityType: `Top Action: ${updatedAction?.title || 'Daily action'}`,
            durationMin: 10,
            intensityLevel: updatedAction?.category === 'movement'
              ? 'MODERATE'
              : updatedAction?.category === 'mindfulness'
                ? 'LOW'
                : 'LOW',
            notes: autoNote,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
