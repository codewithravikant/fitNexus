import { LoginForm } from '@/components/auth/login-form';
import { showGithub, showGoogle } from '@/lib/oauth-config';

export const metadata = { title: 'Sign In - FitNexus' };

export default function LoginPage() {
  return <LoginForm showGithub={showGithub} showGoogle={showGoogle} />;
}
