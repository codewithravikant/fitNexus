import { SMTPClient } from 'smtp-client';

/** smtp-client ships incomplete typings; runtime exposes STARTTLS helpers used for Gmail port 587. */
type SMTPClientWithTls = SMTPClient & {
  hasExtension(extension: string): boolean;
  secure(opts?: { timeout?: number }): Promise<void>;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

function appName() {
  return process.env.NEXT_PUBLIC_APP_NAME || 'FitNexus';
}

/** Public URL for the logo image in emails (PNG/JPG recommended for Gmail; SVG works in many clients). */
function emailLogoSrc(): string {
  const custom = process.env.NEXT_PUBLIC_EMAIL_LOGO_URL?.trim();
  if (custom) return custom;
  return `${appUrl()}/email-logo.svg`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Transactional HTML: table layout, inline styles, bulletproof button (works in common clients).
 */
function buildTransactionalEmail(opts: {
  preheader: string;
  title: string;
  intro: string;
  buttonLabel: string;
  actionUrl: string;
  secondaryHint: string;
}): string {
  const name = escapeHtml(appName());
  const logoUrl = emailLogoSrc();
  const title = escapeHtml(opts.title);
  const intro = escapeHtml(opts.intro);
  const buttonLabel = escapeHtml(opts.buttonLabel);
  const actionUrl = escapeHtml(opts.actionUrl);
  const preheader = escapeHtml(opts.preheader);
  const secondaryHint = escapeHtml(opts.secondaryHint);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#070712;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#070712;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#111827;border:1px solid rgba(139,92,246,0.28);border-radius:16px;">
          <tr>
            <td style="padding:32px 28px 8px 28px;" align="center">
              <img src="${logoUrl}" alt="${name}" width="200" height="44" style="display:block;max-width:200px;height:auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
              <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;font-weight:600;color:#f5f3ff;">${title}</h1>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#9ca3af;">${intro}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td align="center" bgcolor="#8b5cf6" style="border-radius:10px;">
                    <a href="${actionUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;font-weight:600;color:#140a2a;text-decoration:none;border-radius:10px;">${buttonLabel}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:13px;line-height:1.5;color:#6b7280;">${secondaryHint}</p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;word-break:break-all;">
                <a href="${actionUrl}" style="color:#7dd3fc;text-decoration:underline;">${actionUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;">
              ${name} — numbers that don&apos;t lie
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function extractEmailAddress(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const angleMatch = trimmed.match(/<([^>]+)>/);
  if (angleMatch?.[1]) return angleMatch[1].trim();
  if (trimmed.includes('@') && !trimmed.includes(' ')) return trimmed;
  return undefined;
}

function envelopeFromAddress(): string {
  const fromEmail =
    extractEmailAddress(process.env.EMAIL_FROM) ||
    extractEmailAddress(process.env.SMTP_USER) ||
    smtpEnv('SMTP_USER');
  return fromEmail || 'noreply@localhost';
}

function fromAddress() {
  return process.env.EMAIL_FROM || envelopeFromAddress();
}

/** Trimmed non-empty env (avoids Railway/CLI stray spaces breaking SMTP). */
function smtpEnv(name: 'SMTP_HOST' | 'SMTP_USER' | 'SMTP_PASS' | 'SMTP_PORT'): string | undefined {
  const v = process.env[name];
  if (v == null) return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function trimEnvKey(key: string): string | undefined {
  const v = process.env[key];
  if (v == null) return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

/** Host: `SMTP_HOST`, or common aliases `MAIL_HOST` / `EMAIL_HOST` (some hosts use those names). */
function smtpHost(): string | undefined {
  return smtpEnv('SMTP_HOST') || trimEnvKey('MAIL_HOST') || trimEnvKey('EMAIL_HOST');
}

/** Many docs use SMTP_PASSWORD; we accept both. */
function smtpPass(): string | undefined {
  const a = smtpEnv('SMTP_PASS');
  if (a) return a;
  const v = process.env.SMTP_PASSWORD;
  if (v == null) return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

/** Brevo transactional API (HTTPS) — works on hosts that block outbound SMTP. */
function brevoApiKey(): string | undefined {
  const v = process.env.BREVO_API_KEY;
  if (v == null) return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function brevoApiEnabled(): boolean {
  return Boolean(brevoApiKey());
}

/** Sender for Brevo — email must be verified in the Brevo dashboard. */
function resolveBrevoSender(): { email: string; name?: string } | null {
  const raw = process.env.EMAIL_FROM?.trim();
  if (raw) {
    const angle = raw.match(/^(.+?)\s*<([^>]+)>$/);
    if (angle) {
      const name = angle[1].trim().replace(/^["']|["']$/g, '');
      const email = angle[2].trim();
      return { name, email };
    }
    const e = extractEmailAddress(raw);
    if (e) return { email: e };
  }
  const user = smtpEnv('SMTP_USER');
  if (user) {
    const e = extractEmailAddress(user) || user;
    if (e.includes('@')) return { email: e };
  }
  return null;
}

function brevoSender(): { email: string; name?: string } {
  const s = resolveBrevoSender();
  if (!s) {
    throw new Error(
      'Brevo: set EMAIL_FROM to a sender verified in Brevo (e.g. EMAIL_FROM="Your App <you@yourdomain.com>"), or set SMTP_USER to a verified address.',
    );
  }
  return s;
}

const BREVO_TRANSACTIONAL_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendViaBrevoApi(to: string, subject: string, html: string) {
  const key = brevoApiKey();
  if (!key) {
    throw new Error('BREVO_API_KEY is not set');
  }
  const sender = brevoSender();
  const res = await fetch(BREVO_TRANSACTIONAL_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': key,
    },
    body: JSON.stringify({
      sender: sender.name ? { name: sender.name, email: sender.email } : { email: sender.email },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j?.message) detail = j.message;
    } catch {
      /* keep raw body */
    }
    throw new Error(`Brevo API ${res.status}: ${detail}`);
  }
}

function smtpEnabled() {
  return Boolean(smtpHost() && smtpEnv('SMTP_USER') && smtpPass());
}

function isSmtpPortBlockedError(err: unknown): boolean {
  const codes = new Set(['ETIMEDOUT', 'ECONNREFUSED', 'ENETUNREACH', 'EHOSTUNREACH']);
  const check = (e: unknown): boolean => {
    if (e && typeof e === 'object' && 'code' in e && codes.has(String((e as { code?: string }).code))) {
      return true;
    }
    const msg = e instanceof Error ? e.message : String(e);
    return /ETIMEDOUT|ECONNREFUSED|ENETUNREACH/i.test(msg);
  };
  if (check(err)) return true;
  if (err instanceof AggregateError && Array.isArray(err.errors)) {
    return err.errors.some((e) => check(e));
  }
  return false;
}

async function sendViaSmtp(to: string, subject: string, html: string) {
  if (!smtpEnabled()) {
    return;
  }

  const host = smtpHost() as string;
  const user = smtpEnv('SMTP_USER') as string;
  const pass = smtpPass() as string;
  const port = Number(smtpEnv('SMTP_PORT') || '465');
  /** Port 465 uses implicit TLS. Port 587 (and most others) need plain connect + STARTTLS before AUTH — required for Gmail. */
  const implicitTls = port === 465;
  const client = new SMTPClient({
    host,
    port,
    secure: implicitTls,
  }) as SMTPClientWithTls;

  const ehloHostname = process.env.SMTP_EHLO_HOSTNAME?.trim() || host;

  try {
    await client.connect();
    try {
      await client.greet({ hostname: ehloHostname });
      if (!implicitTls && client.hasExtension('STARTTLS')) {
        await client.secure();
        await client.greet({ hostname: ehloHostname });
      }
      await client.authPlain({ username: user, password: pass });
      // SMTP envelope sender must be a plain email address (no display name).
      await client.mail({ from: envelopeFromAddress() });
      await client.rcpt({ to });

      const message = [
        `From: ${fromAddress()}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        html,
        '',
      ].join('\r\n');

      await client.data(message);
    } finally {
      await client.quit();
    }
  } catch (err) {
    if (isSmtpPortBlockedError(err)) {
      throw new Error(
        'SMTP connection failed (often ETIMEDOUT). Many PaaS hosts block outbound SMTP ports 465/587. Use an SMTP relay your network allows, self-host where SMTP is permitted, or run mail from your local machine with Docker.',
        { cause: err },
      );
    }
    throw err;
  }
}

function emailConfigError(): Error {
  const base =
    'No email configured. Set BREVO_API_KEY (Railway → your web service → Variables) and EMAIL_FROM with a Brevo-verified sender, or set SMTP_HOST (or MAIL_HOST), SMTP_USER, and SMTP_PASS (or SMTP_PASSWORD).';
  const user = Boolean(smtpEnv('SMTP_USER'));
  const host = Boolean(smtpHost());
  const pass = Boolean(smtpPass());
  if (!brevoApiEnabled() && user && !host && !pass) {
    return new Error(
      `${base} Hint: only SMTP_USER is set — on Railway use BREVO_API_KEY (HTTPS) instead of partial SMTP, or add SMTP_HOST and SMTP_PASS.`,
    );
  }
  if (!brevoApiEnabled() && user && host && !pass) {
    return new Error(`${base} Hint: set SMTP_PASS or SMTP_PASSWORD.`);
  }
  if (!brevoApiEnabled() && user && !host && pass) {
    return new Error(`${base} Hint: set SMTP_HOST or MAIL_HOST.`);
  }
  return new Error(base);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (brevoApiEnabled()) {
    await sendViaBrevoApi(to, subject, html);
    return;
  }
  if (!smtpEnabled()) {
    throw emailConfigError();
  }
  await sendViaSmtp(to, subject, html);
}

/** Verification emails use SMTP only (no HTTPS transactional APIs). */
async function sendEmailSmtpOnly(to: string, subject: string, html: string) {
  if (!smtpEnabled()) {
    throw new Error(
      'Verification email requires SMTP. Set SMTP_HOST (or MAIL_HOST), SMTP_USER, and SMTP_PASS (or SMTP_PASSWORD), and optionally SMTP_PORT.',
    );
  }
  await sendViaSmtp(to, subject, html);
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const html = buildTransactionalEmail({
    preheader: 'Confirm your email to activate your account.',
    title: 'Verify your email',
    intro:
      'Thanks for signing up. Tap the button below to confirm your email address and finish setting up your account.',
    buttonLabel: 'Verify email',
    actionUrl: link,
    secondaryHint: "If the button doesn't work, copy and paste this link into your browser:",
  });
  await sendEmailSmtpOnly(email, `Verify your ${appName()} account`, html);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const html = buildTransactionalEmail({
    preheader: 'Reset your password securely.',
    title: 'Reset your password',
    intro:
      'We received a request to reset your password. Use the button below to choose a new password. If you didn’t ask for this, you can ignore this email.',
    buttonLabel: 'Reset password',
    actionUrl: link,
    secondaryHint: "If the button doesn't work, copy and paste this link into your browser:",
  });
  await sendEmail(email, `Reset your ${appName()} password`, html);
}

/** For logs only — booleans, no secrets. */
export function getOutboundEmailDiagnostics(): {
  smtpReady: boolean;
  brevoApiKeySet: boolean;
  brevoReady: boolean;
  hasHost: boolean;
  hasUser: boolean;
  hasPass: boolean;
} {
  return {
    smtpReady: smtpEnabled(),
    brevoApiKeySet: brevoApiEnabled(),
    brevoReady: Boolean(brevoApiEnabled() && resolveBrevoSender()),
    hasHost: Boolean(smtpHost()),
    hasUser: Boolean(smtpEnv('SMTP_USER')),
    hasPass: Boolean(smtpPass()),
  };
}

export const __emailInternals = {
  smtpEnabled,
  brevoApiEnabled,
};
