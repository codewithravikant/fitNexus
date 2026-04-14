/** Non-empty trimmed env; empty string in .env disables OAuth for that provider. */
export function oauthEnv(
  name: 'GITHUB_CLIENT_ID' | 'GITHUB_CLIENT_SECRET' | 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET',
): string | undefined {
  const v = process.env[name];
  if (v == null) return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

export const showGithub = Boolean(oauthEnv('GITHUB_CLIENT_ID') && oauthEnv('GITHUB_CLIENT_SECRET'));
export const showGoogle = Boolean(oauthEnv('GOOGLE_CLIENT_ID') && oauthEnv('GOOGLE_CLIENT_SECRET'));
