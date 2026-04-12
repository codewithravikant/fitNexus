#!/bin/sh
set -e

# Run from the app directory (standalone layout: server.js lives next to this file).
cd "$(dirname "$0")" || exit 1

if [ ! -f server.js ]; then
  echo "start.sh: server.js not found. Build with standalone output (e.g. npm run build) or use the Docker image." >&2
  exit 1
fi

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "start.sh: prisma migrate deploy failed." >&2
  exit 1
fi

echo "Starting FitNexus..."
exec node server.js
