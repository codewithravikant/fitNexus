import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

function randomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function generateVerificationToken(userId: string): Promise<string> {
  const token = randomToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: { userId, token, expires },
  });
  return token;
}

export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = randomToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: { userId, token, expires },
  });
  return token;
}

export async function verifyToken(raw: string, kind: 'verification' | 'password-reset'): Promise<string> {
  if (kind === 'verification') {
    const row = await prisma.verificationToken.findUnique({
      where: { token: raw },
    });
    if (!row || row.expires < new Date()) {
      throw new Error('Invalid or expired token');
    }
    await prisma.verificationToken.delete({ where: { token: raw } });
    return row.userId;
  }

  const row = await prisma.passwordResetToken.findUnique({
    where: { token: raw },
  });
  if (!row || row.expires < new Date() || row.used) {
    throw new Error('Invalid or expired token');
  }
  await prisma.passwordResetToken.update({
    where: { token: raw },
    data: { used: true },
  });
  return row.userId;
}
