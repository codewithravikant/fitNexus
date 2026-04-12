import { Resend } from 'resend';
import { SMTPClient } from 'smtp-client';

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

function escapeHtml(s: string): string {
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

function envelopeFromAddress() {
  return (
    extractEmailAddress(process.env.EMAIL_FROM) ||
    extractEmailAddress(process.env.SMTP_USER) ||
    'onboarding@resend.dev'
  );
}

function fromAddress() {
  return process.env.EMAIL_FROM || envelopeFromAddress();
}

function smtpEnabled() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendViaResend(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
    });
    return;
  }
}

async function sendViaSmtp(to: string, subject: string, html: string) {
  if (!smtpEnabled()) {
    return;
  }

  const host = process.env.SMTP_HOST as string;
  const user = process.env.SMTP_USER as string;
  const pass = process.env.SMTP_PASS as string;
  const port = Number(process.env.SMTP_PORT || '465');
  const secure = port === 465;
  const client = new SMTPClient({
    host,
    port,
    secure,
  });

  await client.connect();
  try {
    await client.greet({ hostname: 'localhost' });
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
}

async function sendEmail(to: string, subject: string, html: string) {
  const hasSmtp = smtpEnabled();
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  if (hasSmtp) {
    try {
      await sendViaSmtp(to, subject, html);
      return;
    } catch (error) {
      if (!hasResend) {
        throw error;
      }
    }
  }

  if (hasResend) {
    await sendViaResend(to, subject, html);
    return;
  }

  if (!hasSmtp && !hasResend) {
    throw new Error('No email provider configured');
  }
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
  await sendEmail(email, `Verify your ${appName()} account`, html);
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

export const __emailInternals = {
  smtpEnabled,
};
