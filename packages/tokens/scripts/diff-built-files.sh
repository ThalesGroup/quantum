#!/usr/bin/env bash
set -euo pipefail

REFERENCE="${1:-main}"
OUTPUT_FILE="${2:-build-diff.diff}"
ROOT_DIR="$(git rev-parse --show-toplevel)"
PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
PACKAGE_PATH="${PACKAGE_DIR#"$ROOT_DIR"/}"
CURRENT_BRANCH="$(git branch --show-current)"
TMP_DIR="$(mktemp -d)"
REFERENCE_WORKTREE="$TMP_DIR/reference"
CURRENT_DIST="$TMP_DIR/current-dist"
REFERENCE_DIST="$TMP_DIR/reference-dist"
DIFF_ROOT="$TMP_DIR/diff-root"
LABELLED_CURRENT_DIST="$DIFF_ROOT/current-dist"
LABELLED_REFERENCE_DIST="$DIFF_ROOT/reference-dist"
if [[ "$OUTPUT_FILE" != *.diff ]]; then
  echo "Output file must use the .diff extension." >&2
  exit 1
fi

OUTPUT_PATH="$PACKAGE_DIR/$OUTPUT_FILE"

cleanup() {
  git -C "$ROOT_DIR" worktree remove --force "$REFERENCE_WORKTREE" >/dev/null 2>&1 || true
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

if ! git -C "$ROOT_DIR" rev-parse --verify "$REFERENCE" >/dev/null 2>&1; then
  echo "Branch, tag, or commit '$REFERENCE' does not exist." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required but was not found in PATH." >&2
  exit 1
fi

mkdir -p "$CURRENT_DIST" "$REFERENCE_DIST" "$LABELLED_CURRENT_DIST" "$LABELLED_REFERENCE_DIST"
mkdir -p "$(dirname "$OUTPUT_PATH")"

echo "Preparing temporary worktrees..."
git -C "$ROOT_DIR" worktree add --force --detach "$REFERENCE_WORKTREE" "$REFERENCE" >/dev/null

echo "Building current working tree (${CURRENT_BRANCH:-detached HEAD})..."
(
  cd "$ROOT_DIR"
  pnpm install --frozen-lockfile
  cd "$PACKAGE_DIR"
  pnpm run build
  cp -R dist/. "$CURRENT_DIST"/
)

echo "Building $REFERENCE..."
(
  cd "$REFERENCE_WORKTREE"
  pnpm install --frozen-lockfile
  # References from before the monorepo have the package at the repository root
  if [ -f "$PACKAGE_PATH/package.json" ]; then
    cd "$PACKAGE_PATH"
  fi
  pnpm run build
  cp -R dist/. "$REFERENCE_DIST"/
)

cp -R "$REFERENCE_DIST"/. "$LABELLED_REFERENCE_DIST"/
cp -R "$CURRENT_DIST"/. "$LABELLED_CURRENT_DIST"/

echo "Reference dist directories:"
find "$LABELLED_REFERENCE_DIST" -type d | sed "s#^$DIFF_ROOT/##" | sort

echo "Current dist directories:"
find "$LABELLED_CURRENT_DIST" -type d | sed "s#^$DIFF_ROOT/##" | sort

echo
echo "Writing recursive diff to $OUTPUT_PATH"
(
  cd "$DIFF_ROOT"
  if diff -ru reference-dist current-dist > "$OUTPUT_PATH"; then
    echo "No differences found."
  else
    status=$?
    if [ "$status" -gt 1 ]; then
      echo "diff command failed with status $status" >&2
      exit "$status"
    fi
    echo "Diff written successfully."
  fi
)
