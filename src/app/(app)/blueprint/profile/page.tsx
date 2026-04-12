'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';
import { TwoFactorSetup } from '@/components/settings/two-factor-setup';
import { parseFloatOrOmit, parseIntOrOmit, stripNullishForProfilePatch } from '@/lib/profile-patch';

type AccountState = {
  name: string;
  email: string;
  hasPassword: boolean;
};

export default function ProfilePage() {
  const { update: updateSession } = useSession();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then((r) => {
        if (!r.ok) throw new Error('profile');
        return r.json();
      }),
      fetch('/api/account').then((r) => {
        if (!r.ok) throw new Error('account');
        return r.json();
      }),
    ])
      .then(([p, a]) => {
        setProfile(p);
        setAccount(a as AccountState);
      })
      .catch(() => toast({ title: 'Failed to load profile', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePersonal = async () => {
    if (!profile || !account) return;
    setSaving(true);
    try {
      // JSON.stringify omits keys whose value is undefined — server must always receive `name`.
      const displayName = account.name ?? '';
      const accRes = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName }),
      });
      if (!accRes.ok) {
        const err = await accRes.json().catch(() => ({}));
        throw new Error(err.error || 'Could not update display name');
      }
      const accJson = (await accRes.json()) as AccountState;
      setAccount(accJson);

      try {
        await updateSession({ name: accJson.name || null });
      } catch {
        // Session refresh is best-effort; DB update already succeeded
      }

      const profRes = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stripNullishForProfilePatch(profile as Record<string, unknown>)),
      });
      if (!profRes.ok) {
        const err = await profRes.json().catch(() => ({}));
        throw new Error(err.error || 'Could not update health profile');
      }

      toast({ title: 'Profile updated', description: 'Changes may affect your daily plan', variant: 'success' });
    } catch (e) {
      toast({
        title: 'Failed to save',
        description: e instanceof Error ? e.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account?.hasPassword) return;
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password updated', description: 'Use your new password next time you sign in.', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could not change password',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="py-16" />;
  if (!profile || !account) return <p className="text-center text-muted-foreground py-8">Profile not found</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Profile</h1>
        <p className="text-muted-foreground mt-1">View and edit your account and health profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Re-calibrate your plan</CardTitle>
          <CardDescription>
            Re-run the assessment questionnaire to refresh your personalized recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/onboarding?mode=recalibrate">Start Re-calibration</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Info</CardTitle>
          <CardDescription>Changes will affect your daily plan recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Display name">
            <Input
              value={account.name}
              onChange={(e) => setAccount({ ...account, name: e.target.value })}
              placeholder="Your name"
              autoComplete="name"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Age">
              <Input
                type="number"
                value={typeof profile.age === 'number' && !Number.isNaN(profile.age) ? profile.age : ''}
                onChange={(e) => setProfile({ ...profile, age: parseIntOrOmit(e.target.value) })}
              />
            </FormField>
            <FormField label="Gender">
              <Select value={profile.gender as string || ''} onValueChange={(v) => setProfile({ ...profile, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Height (cm)">
              <Input
                type="number"
                value={
                  typeof profile.heightCm === 'number' && !Number.isNaN(profile.heightCm)
                    ? profile.heightCm
                    : ''
                }
                onChange={(e) => setProfile({ ...profile, heightCm: parseFloatOrOmit(e.target.value) })}
              />
            </FormField>
            <FormField label="Fitness Level">
              <Select value={profile.fitnessLevel as string || ''} onValueChange={(v) => setProfile({ ...profile, fitnessLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Primary Goal">
            <Select value={profile.primaryGoal as string || ''} onValueChange={(v) => setProfile({ ...profile, primaryGoal: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                <SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
                <SelectItem value="GENERAL_FITNESS">General Fitness</SelectItem>
                <SelectItem value="METABOLIC_HEALTH">Metabolic Health</SelectItem>
                <SelectItem value="MENTAL_FOCUS">Mental Focus</SelectItem>
                <SelectItem value="BURNOUT_PREVENTION">Burnout Prevention</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Diet Preference">
            <Select value={profile.dietaryPreference as string || ''} onValueChange={(v) => setProfile({ ...profile, dietaryPreference: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH_PROTEIN">High Protein</SelectItem>
                <SelectItem value="PLANT_BASED">Plant-Based</SelectItem>
                <SelectItem value="LOW_CARB">Low-Carb</SelectItem>
                <SelectItem value="BALANCED">Balanced</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Primary Hobby (optional)">
            <Input
              value={profile.hobbyName as string || ''}
              onChange={(e) => setProfile({ ...profile, hobbyName: e.target.value })}
              placeholder="e.g. Photography"
            />
          </FormField>
          <FormField label="Hobby Activity Style (optional)">
            <Select value={profile.hobbyActivityStyle as string || ''} onValueChange={(v) => setProfile({ ...profile, hobbyActivityStyle: v })}>
              <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SEATED">Mostly seated</SelectItem>
                <SelectItem value="MIXED">Mixed movement</SelectItem>
                <SelectItem value="ACTIVE">Mostly active</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <Button onClick={handleSavePersonal} loading={saving} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card id="sign-in">
        <CardHeader>
          <CardTitle className="text-base">Email &amp; password</CardTitle>
          <CardDescription>Your sign-in email and password for this account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Email">
            <Input type="email" value={account.email} readOnly className="bg-muted/40 text-muted-foreground" />
          </FormField>
          {account.hasPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4 border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">Change password</p>
              <FormField label="Current password">
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </FormField>
              <FormField label="New password">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </FormField>
              <FormField label="Confirm new password">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormField>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                loading={passwordSaving}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Update password
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground border-t border-border pt-4">
              Password sign-in is not set for this account. You signed in with Google, GitHub, or another provider.
            </p>
          )}
        </CardContent>
      </Card>

      <div id="two-factor">
        <TwoFactorSetup />
      </div>
    </div>
  );
}
