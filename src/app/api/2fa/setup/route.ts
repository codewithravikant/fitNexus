import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSecret, generateOtpAuthUri } from '@/lib/two-factor';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitStrict } from '@/lib/rate-limit';

/**
 * POST /api/2fa/setup
 * Generate a new TOTP secret and return the otpauth URI.
 * The secret is stored on the user but 2FA is NOT enabled yet —
 * the user must verify with a code first via /api/2fa/verify.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { success } = rateLimitStrict(session.user.id, '2fa-setup');
    if (!success) throw new ApiError(429, 'Too many requests');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) throw new ApiError(404, 'User not found');
    if (user.twoFactorEnabled) throw new ApiError(400, '2FA is already enabled');

    const secret = generateSecret();
    const otpauthUri = generateOtpAuthUri(secret, user.email);

    // Store the secret (not yet enabled)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({ secret, otpauthUri });
  } catch (error) {
    return handleApiError(error);
  }
}
