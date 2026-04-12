'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';

interface PrivacySettings {
  allowAiDataUsage: boolean;
  allowAnonymizedSharing: boolean;
  emailNotifications: boolean;
  weeklyEmailSummary: boolean;
  marketingEmails: boolean;
}

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile/privacy')
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => toast({ title: 'Failed to load settings', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    if (!settings) return;
    const prev = { ...settings };
    setSettings({ ...settings, [key]: value });

    try {
      const res = await fetch('/api/profile/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSettings(prev);
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="py-16" />;
  if (!settings) return <p className="text-center text-muted-foreground py-8">Settings not found</p>;

  const items = [
    { key: 'allowAiDataUsage' as const, label: 'AI Data Usage', desc: 'Allow FitNexus to use your data for personalized insights' },
    { key: 'allowAnonymizedSharing' as const, label: 'Anonymized Sharing', desc: 'Help improve FitNexus by sharing anonymized wellness patterns' },
    { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive important account notifications' },
    { key: 'weeklyEmailSummary' as const, label: 'Weekly Summary', desc: 'Get a weekly wellness recap by email' },
    { key: 'marketingEmails' as const, label: 'Marketing Emails', desc: 'Receive tips and product updates' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Privacy</h1>
        <p className="text-muted-foreground">Control your data and notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data &amp; Privacy</CardTitle>
          <CardDescription>Your data is encrypted and never sold to third parties</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={(v) => updateSetting(item.key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
