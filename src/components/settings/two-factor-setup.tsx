'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { toast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff, Copy, CheckCircle2, Smartphone } from 'lucide-react';

export function TwoFactorSetup() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'status' | 'setup' | 'disable'>('status');
  const [secret, setSecret] = useState('');
  const [, setOtpauthUri] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/2fa')
      .then((r) => r.json())
      .then((data) => setEnabled(data.enabled))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/2fa/setup', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Setup failed');
      }
      const data = await res.json();
      setSecret(data.secret);
      setOtpauthUri(data.otpauthUri);

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(data.otpauthUri, {
        width: 220,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrDataUrl(dataUrl);

      setStep('setup');
    } catch (err) {
      toast({ title: 'Setup failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Verification failed');
      }
      setEnabled(true);
      setStep('status');
      setCode('');
      toast({ title: '2FA Enabled', description: 'Your account is now protected with two-factor authentication', variant: 'success' });
    } catch (err) {
      toast({ title: 'Verification failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to disable');
      }
      setEnabled(false);
      setStep('status');
      setCode('');
      toast({ title: '2FA Disabled', description: 'Two-factor authentication has been removed', variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-6 w-48 rounded bg-muted animate-pulse-soft mx-auto" />
        </CardContent>
      </Card>
    );
  }

  // ─── Status View ─────────────────────────────────────────────────────────
  if (step === 'status') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {enabled ? (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {enabled
              ? 'Your account is protected with 2FA via an authenticator app.'
              : 'Add an extra layer of security to your account using an authenticator app.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enabled ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Enabled
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStep('disable'); setCode(''); }}
                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <ShieldOff className="h-4 w-4 mr-1" /> Disable
              </Button>
            </div>
          ) : (
            <Button onClick={handleSetup} className="w-full">
              <Shield className="h-4 w-4 mr-2" /> Enable Two-Factor Authentication
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // ─── Setup View ──────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Set Up 2FA</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5" />
              <span>Scan this QR code with your authenticator app</span>
            </div>
            {qrDataUrl ? (
              <div className="rounded-xl border border-border bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="2FA QR Code — scan with your authenticator app"
                  width={220}
                  height={220}
                  className="block"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            ) : (
              <div className="h-[244px] w-[244px] rounded-xl border border-border bg-secondary/30 animate-pulse-soft" />
            )}
          </div>

          {/* Manual entry fallback */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Or enter the key manually
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-mono break-all select-all">
                {secret}
              </code>
              <Button variant="outline" size="sm" onClick={copySecret} className="shrink-0">
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Verification */}
          <div className="border-t border-border pt-4 space-y-3">
            <FormField label="Enter the 6-digit code from your app">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-xl tracking-[0.5em] font-mono"
              />
            </FormField>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('status')} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={code.length !== 6} loading={verifying} className="flex-1">
                Verify & Enable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Disable View ────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-red-400">Disable 2FA</CardTitle>
        <CardDescription>
          Enter your current authenticator code to disable two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="6-digit code">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-xl tracking-[0.5em] font-mono"
          />
        </FormField>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setStep('status'); setCode(''); }} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleDisable}
            disabled={code.length !== 6}
            loading={verifying}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            Disable 2FA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
