import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    '/home/:path*',
    '/fuel/:path*',
    '/vitality/:path*',
    '/blueprint/:path*',
    '/onboarding/:path*',
    '/api/profile/:path*',
    '/api/account/:path*',
    '/api/daily-plan/:path*',
    '/api/stress/:path*',
    '/api/weight/:path*',
    '/api/habits/:path*',
    '/api/meals/:path*',
    '/api/activity/:path*',
    '/api/analytics/:path*',
    '/api/insights/:path*',
    '/api/export/:path*',
    '/api/2fa/:path*',
    '/api/meal-plans/:path*',
    '/api/nutrition/:path*',
  ],
};
