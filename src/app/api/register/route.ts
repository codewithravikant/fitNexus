import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-helpers';
import { signupSchema } from '@/lib/validations/auth';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail, getOutboundEmailDiagnostics } from '@/lib/email';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = await generateVerificationToken(user.id);

    let emailSent = false;
    try {
      await sendVerificationEmail(email, token);
      emailSent = true;
    } catch (emailError) {
      const detail = emailError instanceof Error ? emailError.message : String(emailError);
      console.error('Failed to send verification email:', detail, getOutboundEmailDiagnostics(), emailError);
    }

    return NextResponse.json(
      {
        emailSent,
        message: emailSent
          ? 'Account created. Please check your email to verify your account.'
          : 'Account created, but the verification email could not be sent. Configure SMTP (SMTP_HOST or MAIL_HOST, SMTP_USER, SMTP_PASS) or RESEND_API_KEY on the server, or ask an admin to verify your email.',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
