#!/usr/bin/env bash
# Assemble exactly what gets published, into dist/.
#
# An **allowlist**, deliberately. Pointing Wrangler at the repository root and
# excluding what should not ship is one forgotten pattern away from publishing
# .git — which is the entire history, including anything ever committed by
# mistake — to the open web. This site serves the privacy policy the app loads
# in a WebView; it is not the place to be one typo from a disclosure.
#
# The allowlist now lives in two places, both explicit:
#   - content/site.js  — the generated pages (24 pages x 11 locales, plus the
#                        hand-written legal/support set, which the generator
#                        re-emits with the head tags they were missing).
#   - this file        — assets, and nothing else.
#
# build-pages.js only ever writes paths it computes from that registry, so the
# property that mattered is unchanged: nothing ships that was not named.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist

node build-pages.js

cp -R assets dist/

echo "dist/ assembled: $(find dist -type f | wc -l | tr -d ' ') files"
