import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth-helpers';
import { changePasswordSchema } from '@/lib/validations/auth';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitMutation } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { success } = rateLimitMutation(session.user.id, 'account-password');
    if (!success) throw new ApiError(429, 'Too many requests');

    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (!user) {
      throw new ApiError(401, 'Your session is out of date. Sign out and sign in again.');
    }
    if (!user.password) {
      throw new ApiError(
        400,
        'Password sign-in is not set for this account. You signed in with a social provider.'
      );
    }

    const ok = await verifyPassword(currentPassword, user.password);
    if (!ok) throw new ApiError(400, 'Current password is incorrect');

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: await hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
