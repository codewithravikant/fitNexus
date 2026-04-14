import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resendVerificationSchema } from '@/lib/validations/auth';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitByKey } from '@/lib/rate-limit';

const GENERIC_SUCCESS_MESSAGE =
  'If an account exists with that email and needs verification, a link has been sent.';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = resendVerificationSchema.parse(body);

    const rl = rateLimitByKey(`resend-verify:${email}`, 5, 15 * 60 * 1000);
    if (!rl.success) {
      throw new ApiError(429, 'Too many requests. Please try again later.');
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user || user.emailVerified || !user.password) {
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
    }

    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });

    const token = await generateVerificationToken(user.id);
    try {
      await sendVerificationEmail(user.email, token);
    } catch (err) {
      console.error('Failed to send verification email:', err);
      throw new ApiError(503, 'Email could not be sent. Check SMTP configuration and try again.');
    }

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
  } catch (error) {
    return handleApiError(error);
  }
}
