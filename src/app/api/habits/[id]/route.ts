import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { habitLogSchema } from '@/lib/validations/logging';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { id } = await params;
    const body = await request.json();
    const data = habitLogSchema.partial().parse(body);

    const log = await prisma.habitLog.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!log) throw new ApiError(404, 'Habit log not found');

    const updated = await prisma.habitLog.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { id } = await params;
    const log = await prisma.habitLog.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!log) throw new ApiError(404, 'Habit log not found');

    await prisma.habitLog.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
