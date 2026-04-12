import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail, getOutboundEmailDiagnostics } from '@/lib/email';
import { handleApiError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (user) {
      const token = await generatePasswordResetToken(user.id);
      try {
        await sendPasswordResetEmail(email, token);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error('Failed to send password reset email:', detail, getOutboundEmailDiagnostics(), err);
      }
    }

    return NextResponse.json({
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
