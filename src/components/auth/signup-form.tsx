'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OAuthButtons } from './oauth-buttons';
import { toast } from '@/hooks/use-toast';

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({ title: 'Signup failed', description: result.error, variant: 'destructive' });
        return;
      }

      setEmailSent(result.emailSent !== false);
      setSuccess(true);
      toast({
        title: 'Account created!',
        description: result.message,
        variant: result.emailSent === false ? 'destructive' : 'success',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          {emailSent === false ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Account created — email not sent</h3>
              <p className="text-sm text-muted-foreground text-left max-w-md mx-auto">
                Mail isn&apos;t configured or the provider rejected the send. Add <code className="text-xs bg-muted px-1 rounded">RESEND_API_KEY</code> or{' '}
                <code className="text-xs bg-muted px-1 rounded">SMTP_*</code> in <code className="text-xs bg-muted px-1 rounded">.env</code>, restart the app, then use{' '}
                <strong>Forgot password</strong> or verify your user in the database. Your account still exists.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a verification link to your email address. Click the link to activate your account.
              </p>
            </>
          )}
          <Link href="/login">
            <Button variant="outline" className="mt-4">Back to login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Create your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthButtons />
        <div className="flex items-center gap-3">
          <span className="flex-1 border-t border-border" />
          <span className="text-xs uppercase text-muted-foreground">Or sign up with email</span>
          <span className="flex-1 border-t border-border" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="you@example.com" {...register('email')} />
          </FormField>
          <FormField label="Password" error={errors.password?.message} required hint="Min 8 chars, 1 uppercase, 1 number">
            <Input type="password" placeholder="Create a password" {...register('password')} />
          </FormField>
          <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
            <Input type="password" placeholder="Confirm your password" {...register('confirmPassword')} />
          </FormField>
          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
