#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing system deps"
sudo apt-get update
sudo apt-get install -y --no-install-recommends ca-certificates curl unzip pkg-config build-essential

echo "==> Installing dfx"
# installs to ~/.local/share/dfx and adds shims
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Ensure dfx is available in this shell (Codespaces sometimes needs this)
export PATH="$HOME/bin:$PATH"

echo "==> Node deps (if package.json exists)"
if [ -f package.json ]; then
  npm ci || npm install
fi

echo "==> Done"
dfx --version || true
node --version
npm --version