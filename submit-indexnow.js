#!/usr/bin/env node
/**
 * Pushes this site's URLs to IndexNow, which notifies Bing, Yandex, Seznam and
 * Naver in one request. Google ignores IndexNow entirely and is served by the
 * sitemap instead.
 *
 * This exists because Cloudflare's Crawler Hints — which does the same ping
 * automatically — is a zone setting, and the site is served from a workers.dev
 * subdomain rather than a zone we own. Once treelinker.app is registered and
 * attached, Crawler Hints can be switched on and this script becomes optional.
 *
 * IndexNow is a push, not a subscription: it does not watch the site. Run this
 * after publishing changed content, and not otherwise — resubmitting the same
 * unchanged URLs repeatedly is a documented way to get throttled.
 *
 *   ./build.sh && node submit-indexnow.js          # everything in the sitemap
 *   node submit-indexnow.js /caller-identification # just these paths
 *   node submit-indexnow.js --dry-run              # print, send nothing
 *
 * Ownership is proved by a key file at the site root, which build-pages.js
 * ships byte-for-byte. The key is public by design.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { BASE_URL } = require('./content/site.js');

const ROOT = __dirname;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const explicit = args.filter(a => !a.startsWith('--'));

function fail(message) {
  console.error(`submit-indexnow: ${message}`);
  process.exit(1);
}

/** The hex .txt at the repository root is the IndexNow key, named after itself. */
function findKey() {
  const keys = fs.readdirSync(ROOT).filter(f => /^[0-9a-f]{8,128}\.txt$/.test(f));
  if (keys.length === 0) {
    fail('no IndexNow key file found. Generate one at bing.com/indexnow/getstarted, ' +
         'save it as <key>.txt in this directory, and rebuild so it ships.');
  }
  if (keys.length > 1) fail(`multiple key files found: ${keys.join(', ')}`);
  const file = keys[0];
  const key = fs.readFileSync(path.join(ROOT, file), 'utf8').trim();
  if (key !== path.basename(file, '.txt')) {
    fail(`${file} must contain exactly its own name without the extension`);
  }
  return key;
}

/**
 * The URL list comes from the built sitemap rather than being recomputed from
 * the page registry, so there is exactly one definition of what this site
 * publishes and no chance of the two drifting apart.
 */
function urlsFromSitemap() {
  const file = path.join(ROOT, 'dist', 'sitemap.xml');
  if (!fs.existsSync(file)) fail('dist/sitemap.xml not found — run ./build.sh first');
  const xml = fs.readFileSync(file, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (urls.length === 0) fail('dist/sitemap.xml contains no <loc> entries');
  return urls;
}

async function main() {
  const key = findKey();
  const host = new URL(BASE_URL).host;

  const urls = explicit.length
    ? explicit.map(u => (u.startsWith('http') ? u : `${BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`))
    : urlsFromSitemap();

  const foreign = urls.filter(u => new URL(u).host !== host);
  if (foreign.length) {
    fail(`${foreign.length} URL(s) are not on ${host}, starting with ${foreign[0]}. ` +
         'IndexNow rejects a submission whose host does not match the key file.');
  }

  console.log(`${urls.length} URL(s) for ${host}`);
  if (dryRun) {
    urls.slice(0, 10).forEach(u => console.log(`  ${u}`));
    if (urls.length > 10) console.log(`  … and ${urls.length - 10} more`);
    console.log('--dry-run: nothing sent');
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${BASE_URL}/${key}.txt`,
      urlList: urls,
    }),
  });

  const body = (await res.text()).trim();

  if (res.ok) {
    console.log(`HTTP ${res.status} — ${urls.length} URL(s) accepted`);
    return;
  }

  // The usual first-run case: the key file is live but IndexNow has not fetched
  // it yet. Waiting a few minutes and running again is the whole fix.
  if (res.status === 403 && body.includes('SiteVerificationNotCompleted')) {
    fail(`HTTP 403 — IndexNow has not fetched ${BASE_URL}/${key}.txt yet. ` +
         'Wait a few minutes and run this again.');
  }

  fail(`HTTP ${res.status} — ${body || '(empty response)'}`);
}

main().catch(e => fail(e.message));
