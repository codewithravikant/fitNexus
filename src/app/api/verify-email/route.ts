import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/tokens';
import { handleApiError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Email links used to point here; show the app page instead of raw JSON in the browser.
    // fetch() from /verify-email uses sec-fetch-mode: cors, so verification still runs via JSON.
    if (request.headers.get('sec-fetch-mode') === 'navigate') {
      const url = new URL('/verify-email', request.nextUrl.origin);
      url.searchParams.set('token', token);
      return NextResponse.redirect(url);
    }

    const userId = await verifyToken(token, 'verification');

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
