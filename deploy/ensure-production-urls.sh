#!/usr/bin/env bash
# Ensures EC2 .env uses the live Netlify frontend URL for email links and CORS.
# Safe to run on every deploy — idempotent, preserves unrelated .env values.
set -euo pipefail

ENV_FILE="${1:-.env}"
PRODUCTION_FRONTEND="https://travelhublanka.netlify.app"
LEGACY_FRONTEND="https://travelhub.netlify.app"
CORS_VALUE="${PRODUCTION_FRONTEND},${LEGACY_FRONTEND},http://localhost:5173,http://localhost:5174,http://localhost:3000"

if [ ! -f "$ENV_FILE" ]; then
  echo "ℹ️  No ${ENV_FILE} found — docker-compose defaults will be used."
  exit 0
fi

echo "🔧 Syncing production frontend URLs in ${ENV_FILE}..."

if grep -q '^APP_BASE_URL=' "$ENV_FILE"; then
  sed -i "s|^APP_BASE_URL=.*|APP_BASE_URL=${PRODUCTION_FRONTEND}|" "$ENV_FILE"
else
  echo "APP_BASE_URL=${PRODUCTION_FRONTEND}" >> "$ENV_FILE"
fi

if grep -q '^CORS_ALLOWED_ORIGINS=' "$ENV_FILE"; then
  # Replace legacy-only production URL; append lanka if missing
  sed -i "s|${LEGACY_FRONTEND}|${PRODUCTION_FRONTEND}|g" "$ENV_FILE"
  if ! grep '^CORS_ALLOWED_ORIGINS=' "$ENV_FILE" | grep -q 'travelhublanka.netlify.app'; then
    sed -i "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=${CORS_VALUE}|" "$ENV_FILE"
  fi
else
  echo "CORS_ALLOWED_ORIGINS=${CORS_VALUE}" >> "$ENV_FILE"
fi

echo "✅ APP_BASE_URL=$(grep '^APP_BASE_URL=' "$ENV_FILE" | cut -d= -f2-)"
echo "✅ CORS_ALLOWED_ORIGINS updated"
