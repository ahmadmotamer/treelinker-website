#!/usr/bin/env node
/**
 * Generates every localized page in the site into dist/.
 *
 * Why a generator: the site is 24 pages in 11 locales. Hand-maintaining 264
 * HTML files guarantees they drift — a canonical tag fixed on one page and not
 * the other 263 is worse than no canonical tag, because it is invisible. Copy
 * lives in content/i18n/<locale>.json, structure lives in content/site.js, and
 * markup lives here. Nothing is written twice.
 *
 * It also re-writes the hand-authored pages (privacy, terms, support, ...) on
 * the way through, injecting the head tags they were missing. Those keep their
 * hand-written bodies; only <head> is touched.
 *
 * Safety: this script only ever writes paths it computes from the registry, and
 * build.sh deletes dist/ first. Nothing is copied from the repository root, so
 * the allowlist property of the old build.sh is preserved.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { BASE_URL, LOCALES, DEFAULT_LOCALE, PLAY_URL, PAGES, STATIC_PAGES } =
  require('./content/site.js');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- helpers ---

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** Public URL for a page. English lives at the root; others under /<code>/. */
function urlFor(locale, slug) {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  if (!slug) return `${BASE_URL}${prefix}/`;
  return `${BASE_URL}${prefix}/${slug}`;
}

/** Site-absolute href, for use inside the markup. */
function hrefFor(locale, slug) {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return slug ? `${prefix}/${slug}` : `${prefix}/`;
}

/** Where the file lands in dist/. */
function fileFor(locale, slug) {
  const prefix = locale === DEFAULT_LOCALE ? '' : locale;
  if (!slug) return path.join(DIST, prefix, 'index.html');
  return path.join(DIST, prefix, `${slug}.html`);
}

function write(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents, 'utf8');
}

function pageBySlug(slug) {
  return PAGES.find(p => p.slug === slug);
}

// ------------------------------------------------------------ head blocks ---

/**
 * hreflang set. Every page declares all 11 siblings plus x-default, which is
 * what tells Google these are translations rather than duplicates.
 */
function alternates(slug) {
  const links = LOCALES.map(l =>
    `  <link rel="alternate" hreflang="${l.hreflang}" href="${urlFor(l.code, slug)}" />`
  );
  links.push(`  <link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LOCALE, slug)}" />`);
  return links.join('\n');
}

function openGraph({ title, description, url, locale, type = 'website' }) {
  const ogLocale = locale === 'en' ? 'en_US' : locale;
  return [
    `  <meta property="og:type" content="${type}" />`,
    `  <meta property="og:site_name" content="TreeLinker" />`,
    `  <meta property="og:title" content="${esc(title)}" />`,
    `  <meta property="og:description" content="${esc(description)}" />`,
    `  <meta property="og:url" content="${url}" />`,
    `  <meta property="og:locale" content="${ogLocale}" />`,
    `  <meta property="og:image" content="${BASE_URL}/assets/icons/logo.png" />`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
    `  <meta name="twitter:title" content="${esc(title)}" />`,
    `  <meta name="twitter:description" content="${esc(description)}" />`,
    `  <meta name="twitter:image" content="${BASE_URL}/assets/icons/logo.png" />`,
  ].join('\n');
}

/**
 * The application record. Android only, free — the previous site copy claimed
 * "iOS and Android" and there is no iOS build, which is a factual error Google
 * can act on and an AI assistant will repeat.
 *
 * `featureList` is deliberately the full identity chain, in the same order, on
 * every page: contact management -> family tree -> relationships -> groups ->
 * tags -> events -> memories -> caller identification.
 */
function softwareLd(t) {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${BASE_URL}/#app`,
    name: 'TreeLinker',
    applicationCategory: 'SocialNetworkingApplication',
    applicationSubCategory: t.chrome.identity.category,
    operatingSystem: 'Android',
    description: t.chrome.identity.description,
    featureList: t.chrome.identity.chain,
    url: BASE_URL,
    downloadUrl: PLAY_URL,
    installUrl: PLAY_URL,
    inLanguage: LOCALES.map(l => l.hreflang),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': `${BASE_URL}/#org` },
  };
}

function structuredData(page, locale, t, copy) {
  const url = urlFor(locale, page.slug);
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#org`,
      name: 'TreeLinker',
      url: BASE_URL,
      logo: `${BASE_URL}/assets/icons/logo.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#site`,
      name: 'TreeLinker',
      url: BASE_URL,
      inLanguage: locale,
      publisher: { '@id': `${BASE_URL}/#org` },
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#page`,
      url,
      name: copy.title,
      description: copy.description,
      inLanguage: locale,
      isPartOf: { '@id': `${BASE_URL}/#site` },
      about: { '@id': `${BASE_URL}/#app` },
    },
  ];

  if (page.kind === 'home' || page.kind === 'landing' || page.kind === 'feature') {
    graph.push(softwareLd(t));
  }

  if (page.kind === 'guide' || page.kind === 'compare') {
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: copy.h1,
      description: copy.description,
      inLanguage: locale,
      datePublished: TODAY,
      dateModified: TODAY,
      mainEntityOfPage: { '@id': `${url}#page` },
      author: { '@id': `${BASE_URL}/#org` },
      publisher: { '@id': `${BASE_URL}/#org` },
    });
  }

  if (copy.faq && copy.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: copy.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  // Breadcrumbs, for every page that is not the home page.
  if (page.slug) {
    const trail = [{ name: t.chrome.nav.home, item: urlFor(locale, '') }];
    const parts = page.slug.split('/');
    if (parts.length > 1) {
      trail.push({ name: t.chrome.groups[parts[0]], item: urlFor(locale, parts[0]) });
    }
    trail.push({ name: copy.h1, item: url });
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: trail.map((c, i) => ({
        '@type': 'ListItem', position: i + 1, name: c.name, item: c.item,
      })),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

// -------------------------------------------------------------- chrome -----

function navHtml(locale, t, currentSlug) {
  const items = [
    ['', t.chrome.nav.home],
    ['family-tree-app', t.chrome.nav.familyTree],
    ['family-contact-manager', t.chrome.nav.contacts],
    ['caller-identification', t.chrome.nav.callerId],
    ['guides', t.chrome.nav.guides],
    ['compare', t.chrome.nav.compare],
  ];
  const links = items.map(([slug, label]) => {
    const active = slug === currentSlug
      ? ' class="active" aria-current="page"' : '';
    return `          <li><a href="${hrefFor(locale, slug)}"${active}>${esc(label)}</a></li>`;
  }).join('\n');

  const picker = LOCALES.map(l =>
    `            <li><a href="${hrefFor(l.code, currentSlug)}" hreflang="${l.hreflang}"${
      l.code === locale ? ' aria-current="true"' : ''}>${esc(l.name)}</a></li>`
  ).join('\n');

  return `  <nav class="site-nav" aria-label="${esc(t.chrome.nav.aria)}">
    <div class="container">
      <a href="${hrefFor(locale, '')}" class="nav-logo" aria-label="TreeLinker"><span class="nav-logo-img" aria-hidden="true"></span> TreeLinker</a>
      <ul class="nav-links" role="list">
${links}
          <li class="nav-lang">
            <a href="#lang" class="nav-lang-toggle" aria-haspopup="true" aria-expanded="false">${esc(t.chrome.nav.language)}</a>
            <ul class="nav-lang-menu" role="list">
${picker}
            </ul>
          </li>
      </ul>
      <button class="nav-toggle" aria-label="${esc(t.chrome.nav.menu)}" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6"  x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  </nav>`;
}

/**
 * The identity strip. This is the "knowledge graph" made literal: the same
 * chain of concepts, in the same order, in the same words, on all 264 pages.
 * Consistency is the whole point — it is what lets a search or AI system settle
 * on one answer to "what is TreeLinker".
 */
function identityStrip(locale, t) {
  const links = {
    'contact management': 'family-contact-manager',
    'family tree': 'features/family-tree',
    relationships: 'features/relationships',
    groups: 'features/groups',
    tags: 'features/tags',
    events: 'features/events',
    memories: 'features/memories',
    'caller identification': 'features/caller-identification',
  };
  const order = Object.values(links);
  const chain = t.chrome.identity.chain.map((label, i) =>
    `<a href="${hrefFor(locale, order[i])}">${esc(label)}</a>`
  ).join('<span class="chain-sep" aria-hidden="true">›</span>');

  return `    <section class="section identity-strip" aria-label="${esc(t.chrome.identity.aria)}">
      <div class="container">
        <p class="identity-lede"><strong>TreeLinker</strong> — ${esc(t.chrome.identity.category)}.</p>
        <nav class="identity-chain" aria-label="${esc(t.chrome.identity.aria)}">${chain}</nav>
      </div>
    </section>`;
}

function footerHtml(locale, t) {
  const col = (heading, items) => `        <div class="footer-col">
          <h4>${esc(heading)}</h4>
          <ul>
${items.map(([slug, label]) => `            <li><a href="${hrefFor(locale, slug)}">${esc(label)}</a></li>`).join('\n')}
          </ul>
        </div>`;

  const legal = `        <div class="footer-col">
          <h4>${esc(t.chrome.footer.legal)}</h4>
          <ul>
            <li><a href="/privacy">${esc(t.chrome.footer.privacy)}</a></li>
            <li><a href="/terms">${esc(t.chrome.footer.terms)}</a></li>
            <li><a href="/delete-account">${esc(t.chrome.footer.deleteAccount)}</a></li>
            <li><a href="/support">${esc(t.chrome.footer.support)}</a></li>
          </ul>
        </div>`;

  return `  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="${hrefFor(locale, '')}" class="nav-logo"><span class="nav-logo-img" aria-hidden="true"></span> TreeLinker</a>
          <p>${esc(t.chrome.identity.description)}</p>
        </div>
${col(t.chrome.groups.solutions, [
    ['family-tree-app', t.chrome.nav.familyTree],
    ['family-contact-manager', t.chrome.nav.contacts],
    ['relationship-manager', t.chrome.pages.relationshipManager],
    ['family-organizer', t.chrome.pages.familyOrganizer],
    ['family-memory-app', t.chrome.pages.familyMemoryApp],
    ['caller-identification', t.chrome.nav.callerId],
  ])}
${col(t.chrome.groups.guides, PAGES.filter(p => p.group === 'guides')
    .map(p => [p.slug, t.pages[p.slug].h1]))}
${legal}
      </div>
      <div class="footer-bottom">
        <span>&copy; <span id="year"></span> TreeLinker. ${esc(t.chrome.footer.rights)}</span>
        <span>${esc(t.chrome.footer.madeWith)} <span class="nav-logo-img footer-logo-inline" aria-hidden="true"></span></span>
      </div>
    </div>
  </footer>`;
}

function ctaHtml(locale, t, copy) {
  return `    <section class="section cta-band" id="download">
      <div class="container" style="max-width:40rem;text-align:center;">
        <h2 class="section-title">${esc(copy.ctaTitle || t.chrome.cta.title)}</h2>
        <p class="section-subtitle">${esc(copy.ctaBody || t.chrome.cta.body)}</p>
        <div class="hero-actions" style="justify-content:center;">
          <a href="${PLAY_URL}" class="btn btn-primary" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.18 23.72c.35.2.74.28 1.14.24L15.88 12 12 8.12 3.18 23.72zm18.29-11.01L18.56 11l-3.12 1.75 3.13 3.13 2.9-1.63c.65-.38.65-1.16 0-1.54zM2.15 1.12a1.5 1.5 0 0 0-.21.72v20.28c0 .27.07.52.21.72L14.01 12 2.15 1.12z"/></svg>
            ${esc(t.chrome.cta.play)}
          </a>
        </div>
        <p class="cta-note">${esc(t.chrome.cta.note)}</p>
      </div>
    </section>`;
}

// ------------------------------------------------------------- sections -----

function answerHtml(t, copy) {
  if (!copy.answer) return '';
  return `    <section class="section answer-block" aria-labelledby="direct-answer">
      <div class="container" style="max-width:48rem;">
        <h2 id="direct-answer" class="answer-heading">${esc(t.chrome.labels.answer)}</h2>
        <p class="answer-body">${esc(copy.answer)}</p>
      </div>
    </section>`;
}

function bodyHtml(copy) {
  if (!copy.sections || !copy.sections.length) return '';
  const blocks = copy.sections.map(s => {
    const paras = s.body.map(p => `          <p>${esc(p)}</p>`).join('\n');
    const list = s.list
      ? `          <ul class="prose-list">\n${s.list.map(li => `            <li>${esc(li)}</li>`).join('\n')}\n          </ul>`
      : '';
    return `        <h2>${esc(s.h2)}</h2>\n${paras}\n${list}`;
  }).join('\n');
  return `    <section class="section">
      <div class="container prose" style="max-width:48rem;">
${blocks}
      </div>
    </section>`;
}

function tableHtml(copy) {
  if (!copy.table) return '';
  const head = copy.table.head.map(h => `<th scope="col">${esc(h)}</th>`).join('');
  const rows = copy.table.rows.map(r =>
    `          <tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map(c => `<td>${esc(c)}</td>`).join('')}</tr>`
  ).join('\n');
  return `    <section class="section section-alt">
      <div class="container" style="max-width:52rem;">
        <h2 class="section-title">${esc(copy.table.caption)}</h2>
        <div class="table-wrap">
        <table class="compare-table">
          <thead><tr>${head}</tr></thead>
          <tbody>
${rows}
          </tbody>
        </table>
        </div>
        ${copy.table.note ? `<p class="table-note">${esc(copy.table.note)}</p>` : ''}
      </div>
    </section>`;
}

function faqHtml(t, copy) {
  if (!copy.faq || !copy.faq.length) return '';
  const items = copy.faq.map(f => `          <div class="faq-item">
            <h3>${esc(f.q)}</h3>
            <p>${esc(f.a)}</p>
          </div>`).join('\n');
  return `    <section class="section">
      <div class="container" style="max-width:48rem;">
        <h2 class="section-title">${esc(t.chrome.labels.faq)}</h2>
        <div class="faq-list">
${items}
        </div>
      </div>
    </section>`;
}

function relatedHtml(locale, t, page) {
  if (!page.related || !page.related.length) return '';
  const cards = page.related.map(slug => {
    const c = t.pages[slug];
    if (!c) return '';
    return `          <a class="card related-card" href="${hrefFor(locale, slug)}">
            <h3>${esc(c.h1)}</h3>
            <p>${esc(c.description)}</p>
          </a>`;
  }).join('\n');
  return `    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">${esc(t.chrome.labels.related)}</h2>
        <div class="grid-3">
${cards}
        </div>
      </div>
    </section>`;
}

function breadcrumbHtml(locale, t, page, copy) {
  if (!page.slug) return '';
  const parts = page.slug.split('/');
  const crumbs = [`<a href="${hrefFor(locale, '')}">${esc(t.chrome.nav.home)}</a>`];
  if (parts.length > 1) {
    crumbs.push(`<a href="${hrefFor(locale, parts[0])}">${esc(t.chrome.groups[parts[0]])}</a>`);
  }
  crumbs.push(`<span aria-current="page">${esc(copy.h1)}</span>`);
  return `    <nav class="breadcrumb" aria-label="${esc(t.chrome.labels.breadcrumb)}">
      <div class="container">${crumbs.join('<span class="chain-sep" aria-hidden="true">›</span>')}</div>
    </nav>`;
}

// ------------------------------------------------------------- templates ----

function homeExtras(locale, t, copy) {
  const cards = (copy.cards || []).map(c => `          <div class="card">
            <h3>${esc(c.h3)}</h3>
            <p>${esc(c.p)}</p>
          </div>`).join('\n');
  const steps = (copy.steps || []).map((s, i) => `          <div class="step">
            <div class="step-n" aria-hidden="true">${i + 1}</div>
            <h3>${esc(s.h3)}</h3>
            <p>${esc(s.p)}</p>
          </div>`).join('\n');
  return `    <section class="section section-alt" id="features">
      <div class="container">
        <h2 class="section-title">${esc(copy.featuresTitle)}</h2>
        <p class="section-subtitle">${esc(copy.featuresSubtitle)}</p>
        <div class="grid-3">
${cards}
        </div>
      </div>
    </section>

    <section class="section" id="how-it-works">
      <div class="container">
        <h2 class="section-title">${esc(copy.stepsTitle)}</h2>
        <div class="grid-3">
${steps}
        </div>
      </div>
    </section>`;
}

function renderPage(page, locale, t) {
  const copy = t.pages[page.slug];
  if (!copy) throw new Error(`Missing copy for "${page.slug}" in locale "${locale}"`);

  const loc = LOCALES.find(l => l.code === locale);
  const url = urlFor(locale, page.slug);

  const head = `<!DOCTYPE html>
<html lang="${loc.hreflang}" dir="${loc.dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(copy.title)}</title>
  <meta name="description" content="${esc(copy.description)}" />
  <link rel="canonical" href="${url}" />
${alternates(page.slug)}
${openGraph({
    title: copy.title, description: copy.description, url, locale: loc.hreflang,
    type: page.kind === 'guide' || page.kind === 'compare' ? 'article' : 'website',
  })}
  <link rel="stylesheet" href="/assets/css/style.css" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="icon" type="image/png" href="/assets/icons/logo.png" />
  <script type="application/ld+json">
${structuredData(page, locale, t, copy)}
  </script>
</head>
<body class="page-${page.kind}">`;

  const hero = `    <section class="hero${page.slug ? ' hero-compact' : ''}">
      <div class="container">
        <h1>${esc(copy.h1)}</h1>
        <p>${esc(copy.lead)}</p>
        ${page.slug ? '' : `<div class="hero-actions">
          <a href="${PLAY_URL}" class="btn btn-primary" target="_blank" rel="noopener">${esc(t.chrome.cta.play)}</a>
          <a href="${hrefFor(locale, 'caller-identification')}" class="btn btn-outline brand-text">${esc(t.chrome.cta.secondary)}</a>
        </div>`}
      </div>
    </section>`;

  const main = [
    breadcrumbHtml(locale, t, page, copy),
    hero,
    answerHtml(t, copy),
    page.kind === 'home' ? homeExtras(locale, t, copy) : '',
    bodyHtml(copy),
    tableHtml(copy),
    faqHtml(t, copy),
    identityStrip(locale, t),
    relatedHtml(locale, t, page),
    ctaHtml(locale, t, copy),
  ].filter(Boolean).join('\n\n');

  return `${head}

${navHtml(locale, t, page.slug)}

  <main>
${main}
  </main>

${footerHtml(locale, t)}

  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
  <script src="/assets/js/script.js"></script>
</body>
</html>
`;
}

// ------------------------------------------- hand-written page head patch ---

/**
 * The legal/support pages keep their hand-written bodies. They only gain the
 * head tags they never had: canonical, Open Graph, and an en/x-default hreflang
 * pair (they are English-only by an existing product decision).
 */
function patchStaticPage(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // Cloudflare's asset handling serves `foo.html` at `/foo` and 307s the `.html`
  // form to it. A canonical pointing at the redirecting URL is a self-inflicted
  // wound, so every URL this build emits names the extensionless form.
  const url = `${BASE_URL}/${file.replace(/\.html$/, '')}`;
  const titleMatch = src.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = src.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const title = titleMatch ? titleMatch[1].trim() : 'TreeLinker';
  const description = descMatch ? descMatch[1] : '';

  const inject = `  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />
${openGraph({ title, description, url, locale: 'en' })}
`;

  // Idempotent: never inject twice if the source already carries a canonical.
  if (/rel="canonical"/.test(src)) return src;
  return src.replace(/<\/head>/i, `${inject}</head>`);
}

// -------------------------------------------------------------- sitemap -----

function sitemap() {
  const entries = [];

  for (const page of PAGES) {
    for (const loc of LOCALES) {
      const links = LOCALES.map(l =>
        `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${urlFor(l.code, page.slug)}" />`
      ).join('\n');
      entries.push(`  <url>
    <loc>${urlFor(loc.code, page.slug)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.slug ? 'monthly' : 'weekly'}</changefreq>
    <priority>${page.priority}</priority>
${links}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LOCALE, page.slug)}" />
  </url>`);
    }
  }

  // The section index pages (/guides, /compare, /features) are generated from
  // the registry rather than listed in it, so they are added here explicitly.
  // Leaving them out made them reachable only through the nav, which is how
  // pages quietly stop being indexed.
  for (const group of ['guides', 'compare', 'features']) {
    for (const loc of LOCALES) {
      const links = LOCALES.map(l =>
        `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${urlFor(l.code, group)}" />`
      ).join('\n');
      entries.push(`  <url>
    <loc>${urlFor(loc.code, group)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
${links}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LOCALE, group)}" />
  </url>`);
    }
  }

  for (const s of STATIC_PAGES) {
    entries.push(`  <url>
    <loc>${BASE_URL}/${s.file.replace(/\.html$/, '')}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${s.changefreq}</changefreq>
    <priority>${s.priority}</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
}

// ----------------------------------------------------------------- main -----

function main() {
  const t = {};
  for (const loc of LOCALES) {
    const file = path.join(ROOT, 'content', 'i18n', `${loc.code}.json`);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing translation file: content/i18n/${loc.code}.json`);
    }
    t[loc.code] = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  // Key parity across locales, checked at build time.
  //
  // Every locale file must carry exactly the keys English carries. A missing
  // key renders as `undefined` in the page or throws deep inside a template,
  // and either way it ships. The same rule holds in the Flutter app for
  // assets/languages/*.json; this is that rule for the website.
  const missing = [];
  const walk = (ref, got, locale, path = '') => {
    for (const key of Object.keys(ref)) {
      const here = path ? `${path}.${key}` : key;
      if (!(key in got)) { missing.push(`${locale}: ${here}`); continue; }
      if (ref[key] && typeof ref[key] === 'object' && !Array.isArray(ref[key])) {
        walk(ref[key], got[key], locale, here);
      }
    }
  };
  for (const loc of LOCALES) {
    if (loc.code === DEFAULT_LOCALE) continue;
    walk(t[DEFAULT_LOCALE], t[loc.code], loc.code);
  }
  if (missing.length) {
    throw new Error(
      `Translation keys missing (${missing.length}):\n  ` + missing.join('\n  ')
    );
  }

  let count = 0;
  for (const loc of LOCALES) {
    for (const page of PAGES) {
      write(fileFor(loc.code, page.slug), renderPage(page, loc.code, t[loc.code]));
      count++;
    }
    // Section index pages (/guides, /compare, /features) are generated from the
    // registry so a crawler entering mid-tree always finds the rest of it.
    for (const group of ['guides', 'compare', 'features']) {
      const members = PAGES.filter(p => p.group === group);
      const tt = t[loc.code];
      const cards = members.map(p => `          <a class="card related-card" href="${hrefFor(loc.code, p.slug)}">
            <h3>${esc(tt.pages[p.slug].h1)}</h3>
            <p>${esc(tt.pages[p.slug].description)}</p>
          </a>`).join('\n');
      const url = urlFor(loc.code, group);
      const html = `<!DOCTYPE html>
<html lang="${loc.hreflang}" dir="${loc.dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(tt.chrome.groups[group])} — TreeLinker</title>
  <meta name="description" content="${esc(tt.chrome.groupDescriptions[group])}" />
  <link rel="canonical" href="${url}" />
${alternates(group)}
${openGraph({ title: `${tt.chrome.groups[group]} — TreeLinker`, description: tt.chrome.groupDescriptions[group], url, locale: loc.hreflang })}
  <link rel="stylesheet" href="/assets/css/style.css" />
  <link rel="icon" type="image/png" href="/assets/icons/logo.png" />
</head>
<body class="page-index">
${navHtml(loc.code, tt, group)}
  <main>
    <section class="hero hero-compact">
      <div class="container">
        <h1>${esc(tt.chrome.groups[group])}</h1>
        <p>${esc(tt.chrome.groupDescriptions[group])}</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="grid-3">
${cards}
        </div>
      </div>
    </section>
${identityStrip(loc.code, tt)}
  </main>
${footerHtml(loc.code, tt)}
  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
  <script src="/assets/js/script.js"></script>
</body>
</html>
`;
      write(fileFor(loc.code, group), html);
      count++;
    }
  }

  for (const s of STATIC_PAGES) {
    write(path.join(DIST, s.file), patchStaticPage(s.file));
    count++;
  }
  // Search-engine site verification files. Copied byte-for-byte: the verifier
  // compares exact contents, so these must NOT go through the head injector that
  // the other hand-written pages use.
  for (const f of fs.readdirSync(ROOT)) {
    if (/^google[0-9a-f]+\.html$/.test(f) || /^BingSiteAuth\.xml$/.test(f)) {
      write(path.join(DIST, f), fs.readFileSync(path.join(ROOT, f), 'utf8'));
      console.log(`  verification file: ${f}`);
    }
  }

  write(path.join(DIST, '404.html'), fs.readFileSync(path.join(ROOT, '404.html'), 'utf8'));
  write(path.join(DIST, 'manifest.webmanifest'), fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  write(path.join(DIST, 'sitemap.xml'), sitemap());
  write(path.join(DIST, 'robots.txt'), robots());

  console.log(`generated ${count} pages across ${LOCALES.length} locales`);
}

main();
