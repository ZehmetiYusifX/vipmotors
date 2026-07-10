#!/usr/bin/env bash
# One-command deploy: push main, then trigger the server to pull + rebuild + up.
# Uses SSH KEY auth (no password). Run `npm run deploy:setup` once first.
#
# Usage: npm run deploy   (or: bash scripts/deploy.sh)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../deploy.config.sh
source "$DIR/deploy.config.sh"

SSH_OPTS="-o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new"
TARGET="$SERVER_USER@$SERVER_HOST"

echo "==> [1/3] push $LOCAL_BRANCH to origin"
git push origin "$LOCAL_BRANCH"

echo "==> [2/3] verifying passwordless SSH to $TARGET"
if ! ssh $SSH_OPTS "$TARGET" 'echo ok' >/dev/null 2>&1; then
  echo ""
  echo "  ✗ Cannot SSH with a key. Run this ONCE to set up your key:"
  echo "      npm run deploy:setup"
  echo ""
  exit 1
fi

echo "==> [3/3] deploy on server ($SERVER_PATH)"
# Pull the latest server-deploy.sh (part of the repo) and run it.
ssh $SSH_OPTS "$TARGET" \
  "cd '$SERVER_PATH' && git fetch origin && git reset --hard '@{u}' && bash scripts/server-deploy.sh '$SERVER_PATH' '$HEALTH_URL'"

echo ""
echo "✓ DEPLOY DONE — $HEALTH_URL"
