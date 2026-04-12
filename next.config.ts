import type { NextConfig } from "next";

/** Hostnames (and host:port) allowed for Server Actions — include prod URL via NEXT_PUBLIC_APP_URL or RAILWAY_STATIC_URL at build time. */
function serverActionAllowedOrigins(): string[] {
  const origins = new Set<string>([
    "localhost:3000",
    "127.0.0.1:3000",
    "localhost:3001",
    "127.0.0.1:3001",
  ]);
  for (const key of ["NEXT_PUBLIC_APP_URL", "RAILWAY_STATIC_URL"] as const) {
    const raw = process.env[key];
    if (!raw) continue;
    try {
      const u = new URL(raw);
      origins.add(u.port ? `${u.hostname}:${u.port}` : u.hostname);
    } catch {
      // ignore invalid URL
    }
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  allowedDevOrigins: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://localhost:3001",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins(),
    },
  },
};

export default nextConfig;
