#!/usr/bin/env bash
# Deploy the VibeLyf SPA to Cloudflare Pages — ALWAYS from a fresh staging tree.
#
# Why this exists: on 2026-06-05 an incremental deploy reused a stale /tmp staging
# dir that Windows had partially purged (index.html was gone), which shipped a
# deployment with no root document — the live site 404'd until redeployed.
# Never deploy from an incrementally-patched staging dir. Rebuild every time.
#
# Usage:  ./deploy-pages.sh          (from the repo root, Git Bash)
# Needs:  CLOUDFLARE_API_TOKEN in .env

set -euo pipefail
cd "$(dirname "$0")"

STG=$(mktemp -d)
trap 'rm -rf "$STG"' EXIT

cp -r css js data images videos "$STG/"
cp index.html privacy.html manifest.json sw.js "$STG/"
for f in README.md SECURITY.md LICENSE SAVE_STATE.md CONTRIBUTING.md; do
    [ -f "$f" ] && cp "$f" "$STG/"
done

# Sanity gate: refuse to deploy a tree without the root document.
[ -f "$STG/index.html" ] || { echo "FATAL: index.html missing from staging"; exit 1; }

export CLOUDFLARE_API_TOKEN=$(grep '^CLOUDFLARE_API_TOKEN=' .env | cut -d= -f2 | tr -d '\r\n')
npx wrangler pages deploy "$STG" --project-name vibelyf --branch main --commit-dirty=true
