import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTOTP } from '@/lib/two-factor';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitStrict } from '@/lib/rate-limit';

/**
 * POST /api/2fa/verify
 * Verify a TOTP code and enable 2FA for the user.
 * Body: { code: "123456" }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { success } = rateLimitStrict(session.user.id, '2fa-verify');
    if (!success) throw new ApiError(429, 'Too many attempts');

    const { code } = await request.json();
    if (!code || typeof code !== 'string' || code.length !== 6) {
      throw new ApiError(400, 'A valid 6-digit code is required');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorSecret) throw new ApiError(400, 'Run 2FA setup first');
    if (user.twoFactorEnabled) throw new ApiError(400, '2FA is already enabled');

    const isValid = verifyTOTP(user.twoFactorSecret, code);
    if (!isValid) throw new ApiError(400, 'Invalid code. Please try again.');

    // Enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ enabled: true, message: '2FA has been enabled' });
  } catch (error) {
    return handleApiError(error);
  }
}
