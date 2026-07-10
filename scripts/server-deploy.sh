#!/usr/bin/env bash
# Runs ON the server (invoked over SSH by scripts/deploy.sh).
# Pulls the latest code, rebuilds the image, recreates the container via compose
# (env_file guaranteed), then health-checks. Build happens BEFORE recreate, so a
# broken build can never take the live site down.
set -euo pipefail

REPO_DIR="${1:-/opt/vipmotors-landing}"
HEALTH_URL="${2:-https://vipmotors.az/}"

cd "$REPO_DIR"

echo "==> git pull --ff-only"
git fetch origin
git reset --hard "@{u}"          # match remote exactly; deploy is not for local edits
git log --oneline -1

# docker compose v2 (plugin) or legacy v1
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
else
  DC="docker-compose"
fi

echo "==> build (site stays up on the OLD container until this succeeds)"
$DC build

echo "==> recreate container (env_file from compose is always applied)"
$DC up -d

echo "==> waiting for container to come up on :3000"
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ --max-time 10 || echo 000)
  [ "$code" = "200" ] && { echo "local :3000 -> 200"; break; }
  sleep 3
done

echo "==> GEMINI_API_KEY present in container?"
if docker exec vipmotors-landing sh -c '[ -n "$GEMINI_API_KEY" ]'; then
  echo "GEMINI_API_KEY: set"
else
  echo "GEMINI_API_KEY: MISSING — check /root/frontend-env" >&2
  exit 1
fi

echo "==> public health-check $HEALTH_URL"
code=$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL" --max-time 20 || echo 000)
if [ "$code" = "200" ]; then
  echo "SERVER_DEPLOY_OK ($code)"
else
  echo "HEALTH_CHECK_FAILED ($code)" >&2
  exit 1
fi
