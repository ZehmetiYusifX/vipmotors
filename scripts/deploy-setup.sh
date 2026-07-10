#!/usr/bin/env bash
# ONE-TIME per developer: install your SSH public key on the deploy server so
# `npm run deploy` works without a password afterwards.
# You will be asked for the shared server password ONCE here (never stored).
#
# Usage: npm run deploy:setup   (or: bash scripts/deploy-setup.sh)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../deploy.config.sh
source "$DIR/deploy.config.sh"

TARGET="$SERVER_USER@$SERVER_HOST"
KEY="$HOME/.ssh/id_ed25519"

# 1. Ensure a local key exists.
if [ ! -f "$KEY" ]; then
  echo "==> no SSH key found — generating $KEY"
  ssh-keygen -t ed25519 -N "" -f "$KEY" -C "vipmotors-deploy-$(whoami)"
fi
PUB="$(cat "$KEY.pub")"

# 2. Already set up? Then we're done.
if ssh -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=accept-new "$TARGET" 'echo ok' >/dev/null 2>&1; then
  echo "✓ Passwordless SSH already works. You're ready: run  npm run deploy"
  exit 0
fi

# 3. Install the public key (idempotent). Prompts for the shared password ONCE.
echo "==> installing your public key on $TARGET (enter the shared server password once)"
ssh -o StrictHostKeyChecking=accept-new "$TARGET" \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && grep -qxF '$PUB' ~/.ssh/authorized_keys || echo '$PUB' >> ~/.ssh/authorized_keys"

# 4. Verify.
if ssh -o BatchMode=yes -o ConnectTimeout=15 "$TARGET" 'echo ok' >/dev/null 2>&1; then
  echo ""
  echo "✓ SSH key installed. From now on just run:  npm run deploy"
else
  echo "✗ Key auth still not working — check server access and try again." >&2
  exit 1
fi
