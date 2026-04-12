'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OAuthButtons } from './oauth-buttons';
import { toast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

function safeCallbackPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/')) return '/home';
  if (raw.startsWith('//')) return '/home';
  return raw.split('?')[0] || '/home';
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        twoFactorCode: show2FA ? twoFactorCode : '',
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        const code = result?.code;

        if (code === 'email_not_verified') {
          toast({
            title: 'Email not verified',
            description: 'Please check your inbox and verify your email before signing in.',
            variant: 'destructive',
          });
        } else if (code === 'oauth_only') {
          toast({
            title: 'Sign in with Google or GitHub',
            description:
              'This email has no password on file (it was created with a social login). Use the Google or GitHub button above, or use Forgot password to set a password and then sign in with email.',
            variant: 'destructive',
          });
        } else if (code === 'invalid_2fa') {
          setShow2FA(true);
          toast({
            title: 'Invalid 2FA code',
            description: 'The two-factor code is incorrect or expired. Please try again.',
            variant: 'destructive',
          });
        } else if (!show2FA) {
          toast({
            title: 'Login failed',
            description: 'Invalid email or password.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Login failed',
            description: 'Invalid credentials or 2FA code.',
            variant: 'destructive',
          });
        }
        return;
      }

      // Full page navigation ensures the session cookie is sent correctly.
      const next = safeCallbackPath(searchParams.get('callbackUrl'));
      window.location.href = next;
    } catch {
      toast({
        title: 'Login failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Sign in to your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthButtons />
        <div className="flex items-center gap-3">
          <span className="flex-1 border-t border-border" />
          <span className="text-xs uppercase text-muted-foreground">Or continue with email</span>
          <span className="flex-1 border-t border-border" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="you@example.com" {...register('email')} />
          </FormField>
          <FormField label="Password" error={errors.password?.message} required>
            <Input type="password" placeholder="Enter your password" {...register('password')} />
          </FormField>

          {/* 2FA Code Field — shown after first failed attempt or on toggle */}
          {show2FA && (
            <FormField label="Two-Factor Code">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center tracking-[0.3em] font-mono"
                />
              </div>
            </FormField>
          )}

          {!show2FA && (
            <button
              type="button"
              onClick={() => setShow2FA(true)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Shield className="h-3 w-3" /> I have a 2FA code
            </button>
          )}

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
