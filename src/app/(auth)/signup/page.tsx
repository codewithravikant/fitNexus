import { SignupForm } from '@/components/auth/signup-form';
import { showGithub, showGoogle } from '@/lib/oauth-config';

export const metadata = { title: 'Sign Up - FitNexus' };

export default function SignupPage() {
  return <SignupForm showGithub={showGithub} showGoogle={showGoogle} />;
}
