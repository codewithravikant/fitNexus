import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError } from '@/lib/api-error';
import { observationSummarySchema } from '@/lib/validations/logging';
import { decryptForUser, encryptForUser } from '@/lib/observation/server-crypto';
import type { ObservationSummaryStored } from '@/lib/observation/types';

const MODEL_NAME = 'observation_summary_v1';

type EncryptedEnvelope = { encrypted?: { iv: string; content: string; tag: string } };

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const url = new URL(request.url);
    const requestedId = url.searchParams.get('id');

    if (requestedId) {
      const record = await prisma.aIInsight.findFirst({
        where: {
          id: requestedId,
          userId: session.user.id,
          modelUsed: MODEL_NAME,
        },
      });

      if (!record) {
        throw new ApiError(404, 'Observation not found');
      }

      const payload = record.recommendations as EncryptedEnvelope;
      const decrypted = payload.encrypted
        ? decryptForUser<ObservationSummaryStored>(session.user.id, payload.encrypted)
        : null;

      return NextResponse.json({
        observation: decrypted,
        entry: {
          id: record.id,
          capturedAt: record.generatedAt.toISOString(),
          source: record.weeklyFocus || 'manual',
        },
      });
    }

    const history = await prisma.aIInsight.findMany({
      where: { userId: session.user.id, modelUsed: MODEL_NAME },
      orderBy: { generatedAt: 'desc' },
      take: 7,
    });

    return NextResponse.json({
      history: history.map((item) => ({
        id: item.id,
        capturedAt: item.generatedAt.toISOString(),
        source: item.weeklyFocus || 'manual',
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const body = await request.json().catch(() => ({}));
    const data = observationSummarySchema.parse(body);
    const capturedAt = new Date().toISOString();
    const encrypted = encryptForUser(session.user.id, { ...data, capturedAt });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.aIInsight.findFirst({
      where: {
        userId: session.user.id,
        modelUsed: MODEL_NAME,
        generatedAt: { gte: today },
      },
      orderBy: { generatedAt: 'desc' },
    });

    if (existing) {
      await prisma.aIInsight.update({
        where: { id: existing.id },
        data: {
          generatedAt: new Date(),
          recommendations: JSON.parse(JSON.stringify({
            encrypted,
            version: MODEL_NAME,
          })),
          insightText: 'Encrypted observation summary',
          weeklyFocus: data.source,
        },
      });
    } else {
      await prisma.aIInsight.create({
        data: {
          userId: session.user.id,
          generatedAt: new Date(),
          insightText: 'Encrypted observation summary',
          recommendations: JSON.parse(JSON.stringify({
            encrypted,
            version: MODEL_NAME,
          })),
          fallbackUsed: true,
          promptVersion: 'observation-v1',
          modelUsed: MODEL_NAME,
          weeklyFocus: data.source,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
