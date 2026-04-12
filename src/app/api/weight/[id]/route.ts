import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { id } = await params;
    const log = await prisma.weightLog.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!log) throw new ApiError(404, 'Weight log not found');

    await prisma.weightLog.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
