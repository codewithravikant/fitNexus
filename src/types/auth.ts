import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      hasProfile: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    hasProfile?: boolean;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    hasProfile: boolean;
    name?: string | null;
    email?: string | null;
  }
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}
