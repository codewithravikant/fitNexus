import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function deriveKey(userId: string) {
  const secret =
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'development-secret');
  if (!secret) {
    throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set for observation encryption');
  }
  return createHash('sha256').update(`${secret}:${userId}`).digest();
}

export function encryptForUser<T extends object>(userId: string, data: T) {
  const key = deriveKey(userId);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plain = Buffer.from(JSON.stringify(data), 'utf8');
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    content: enc.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decryptForUser<T>(
  userId: string,
  envelope: { iv: string; content: string; tag: string }
): T {
  const key = deriveKey(userId);
  const iv = Buffer.from(envelope.iv, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(envelope.content, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(dec.toString('utf8')) as T;
}
