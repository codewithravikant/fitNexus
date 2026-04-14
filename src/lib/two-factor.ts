import { generateSecret as otplibGenerateSecret, generateURI, verify } from 'otplib';

export function generateSecret() {
  return otplibGenerateSecret();
}

export function generateOtpAuthUri(secret: string, email: string) {
  const issuer = process.env.NEXT_PUBLIC_APP_NAME || 'FitNexus';
  return generateURI({ issuer, label: email, secret });
}

export async function verifyTOTP(token: string, secret: string) {
  const result = await verify({ token, secret });
  return result.valid;
}
