#!/usr/bin/env bash
# Check the design system, then tag a release of the tokens.
set -euo pipefail

readonly VERSION="${1:?usage: release.sh <version>}"
readonly OUT_DIR="${OUT_DIR:-build}"
declare -i attempts=0

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*" >&2; }

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  log "not a semantic version: $VERSION"
  exit 64
fi

until pnpm check > "$OUT_DIR/check.log" 2>&1; do
  attempts+=1
  (( attempts >= 3 )) && { log "pnpm check failed $attempts times"; exit 1; }
  sleep $(( attempts * 2 ))
done

for file in platforms/*/*.tokens.json; do
  case "$file" in
    *dark*) mode=dark ;;
    *) mode=light ;;
  esac
  cp "$file" "$OUT_DIR/$(basename "$(dirname "$file")")-$mode.json"
done

git tag --annotate "tokens-v$VERSION" --message "Tokens $VERSION" \
  && log "tagged tokens-v$VERSION"
