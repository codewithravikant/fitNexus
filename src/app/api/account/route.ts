import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { patchAccountSchema } from '@/lib/validations/auth';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitMutation } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, password: true },
    });
    if (!user) {
      throw new ApiError(401, 'Your session is out of date. Sign out and sign in again.');
    }

    return NextResponse.json({
      name: user.name ?? '',
      email: user.email,
      hasPassword: Boolean(user.password),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { success } = rateLimitMutation(session.user.id, 'account-update');
    if (!success) throw new ApiError(429, 'Too many requests');

    const body = await request.json();
    const { name } = patchAccountSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name === '' ? null : name },
      select: { name: true, email: true, password: true },
    });

    return NextResponse.json({
      name: user.name ?? '',
      email: user.email,
      hasPassword: Boolean(user.password),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
