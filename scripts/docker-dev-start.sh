#!/bin/sh
set -e
cd /app

# Colors (fallback if no TTY)
if [ -t 1 ]; then
  BOLD="\033[1m"
  DIM="\033[2m"
  GREEN="\033[32m"
  CYAN="\033[36m"
  RESET="\033[0m"
else
  BOLD=""
  DIM=""
  GREEN=""
  CYAN=""
  RESET=""
fi

echo ""
echo "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo "${BOLD}  FitNexus — Docker ${GREEN}DEV${RESET}${BOLD} mode${RESET}"
echo "${DIM}  Next.js hot reload · Postgres in Compose · Prisma migrate on start${RESET}"
echo "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "  ${BOLD}App${RESET}     http://localhost:${PORT:-3000}"
echo "  ${BOLD}Health${RESET}  http://localhost:${PORT:-3000}/api/health"
echo "  ${BOLD}Postgres${RESET} host port ${GREEN}5433${RESET} → container db:5432"
echo "  ${BOLD}DATABASE_URL${RESET} should use host ${CYAN}db${RESET} (set by Compose)"
echo ""
echo "${DIM}  Tip: edit files on your machine; watcher uses polling (WATCHPACK_POLLING).${RESET}"
echo "${DIM}  After package.json / lockfile changes: rebuild (docker compose ... up --build) or run npm ci in the container.${RESET}"
echo ""

if [ ! -f node_modules/.bin/next ]; then
  echo "${BOLD}node_modules missing (fresh volume) — running npm ci...${RESET}"
  npm ci --legacy-peer-deps
  npx prisma generate
  echo ""
fi

echo "${BOLD}Running Prisma migrations...${RESET}"
if ! npx prisma migrate deploy; then
  echo "${BOLD}migrate deploy failed.${RESET}" >&2
  exit 1
fi

echo "${BOLD}${GREEN}Starting Next.js dev server...${RESET}"
echo ""

exec npm run dev -- --hostname 0.0.0.0 --port "${PORT:-3000}"
