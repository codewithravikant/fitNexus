#!/bin/sh
set -e

# Run from the app directory (standalone layout: server.js lives next to this file).
cd "$(dirname "$0")" || exit 1

if [ ! -f server.js ]; then
  echo "start.sh: server.js not found. Build with standalone output (e.g. npm run build) or use the Docker image." >&2
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "start.sh: DATABASE_URL is not set. On Railway, add Postgres and set DATABASE_URL to the database service URL (not localhost)." >&2
  exit 1
fi

# Railway (and similar hosts) cannot reach your machine — local Docker URLs will fail with P1001.
if [ -n "${RAILWAY_ENVIRONMENT:-}" ] || [ -n "${RAILWAY_SERVICE_ID:-}" ]; then
  case "${DATABASE_URL}" in
    *localhost*|*127.0.0.1*)
      echo "start.sh: DATABASE_URL uses localhost, which is wrong on Railway." >&2
      echo "      In the Railway dashboard: Variables → set DATABASE_URL from your Postgres plugin (e.g. reference \${{Postgres.DATABASE_URL}}) or paste the connection string Railway shows for Postgres." >&2
      exit 1
      ;;
  esac
  if [ -z "${AUTH_SECRET:-}" ] && [ -z "${NEXTAUTH_SECRET:-}" ]; then
    echo "start.sh: Set AUTH_SECRET or NEXTAUTH_SECRET on the web service (e.g. openssl rand -base64 32). Auth.js requires it in production." >&2
    exit 1
  fi
fi

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "start.sh: prisma migrate deploy failed." >&2
  exit 1
fi

echo "Starting FitNexus..."
exec node server.js
