#!/bin/sh
# shot.sh <url> <out.png> [width] [height]
# Headless screenshot at 2x with Playwright's chrome-headless-shell (exits by itself, no browser pane needed).
# Install it once if missing: pnpm dlx playwright install chromium-headless-shell
SHELL_BIN=$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell 2>/dev/null | sort -V | tail -1)
if [ -z "$SHELL_BIN" ]; then
  echo "chrome-headless-shell not found: pnpm dlx playwright install chromium-headless-shell" >&2
  exit 1
fi
"$SHELL_BIN" --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size="${3:-1060},${4:-520}" --virtual-time-budget=3000 \
  --screenshot="$2" "$1" 2>/dev/null
ls -la "$2"
