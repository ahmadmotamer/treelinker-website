#!/usr/bin/env bash
# Assemble exactly what gets published, into dist/.
#
# An **allowlist**, deliberately. Pointing Wrangler at the repository root and
# excluding what should not ship is one forgotten pattern away from publishing
# .git — which is the entire history, including anything ever committed by
# mistake — to the open web. This site serves the privacy policy the app loads
# in a WebView; it is not the place to be one typo from a disclosure.
#
# Add a file here when the site gains one. Nothing ships that is not listed.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist

for page in index.html privacy.html terms.html support.html contact.html \
            delete-account.html child_safety_standards.html 404.html \
            robots.txt sitemap.xml manifest.webmanifest; do
  cp "$page" dist/
done

cp -R assets dist/

echo "dist/ assembled: $(find dist -type f | wc -l | tr -d ' ') files"
