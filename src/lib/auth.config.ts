import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [],
  trustHost: true,
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;
