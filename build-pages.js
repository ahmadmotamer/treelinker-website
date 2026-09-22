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
const { BASE_URL, LOCALES, DEFAULT_LOCALE, PLAY_URL, SHOTS, PAGES, STATIC_PAGES } =
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

// One typeface, three weights. DM Sans is the app's own UI face (AppTextStyles)
// and its variable axis reaches 800, so the display weight comes from the same
// family rather than a second one — Lato was a whole extra font download buying
// a heading weight this one already had.
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght' +
  '@0,9..40,400;0,9..40,600;0,9..40,800;1,9..40,400&display=swap';

/**
 * The head tags every page needs and none of them carried consistently.
 *
 * The fonts were being pulled by an @import at the top of style.css, which
 * serialises HTML -> CSS -> font CSS -> font files. Loading them here, behind a
 * preconnect, starts the fetch with the document.
 */
const COMMON_HEAD = `  <meta name="theme-color" content="#FAFAF5" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#131C0C" media="(prefers-color-scheme: dark)" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${FONTS_HREF}" />
  <link rel="stylesheet" href="/assets/css/style.css" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png" />
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png" />`;

function openGraph({ title, description, url, locale, type = 'website' }) {
  const ogLocale = locale === 'en' ? 'en_US' : locale;
  return [
    `  <meta property="og:type" content="${type}" />`,
    `  <meta property="og:site_name" content="TreeLinker" />`,
    `  <meta property="og:title" content="${esc(title)}" />`,
    `  <meta property="og:description" content="${esc(description)}" />`,
    `  <meta property="og:url" content="${url}" />`,
    `  <meta property="og:locale" content="${ogLocale}" />`,
    `  <meta property="og:image" content="${BASE_URL}/assets/icons/og.jpg" />`,
    `  <meta property="og:image:width" content="1200" />`,
    `  <meta property="og:image:height" content="630" />`,
    `  <meta property="og:image:alt" content="TreeLinker" />`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
    `  <meta name="twitter:title" content="${esc(title)}" />`,
    `  <meta name="twitter:description" content="${esc(description)}" />`,
    `  <meta name="twitter:image" content="${BASE_URL}/assets/icons/og.jpg" />`,
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
      logo: `${BASE_URL}/assets/icons/icon-512.png`,
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
            <button type="button" class="nav-lang-toggle" aria-expanded="false" aria-controls="lang-menu">
              ${esc(t.chrome.nav.language)}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <ul class="nav-lang-menu" id="lang-menu" role="list">
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
          <h2>${esc(heading)}</h2>
          <ul>
${items.map(([slug, label]) => `            <li><a href="${hrefFor(locale, slug)}">${esc(label)}</a></li>`).join('\n')}
          </ul>
        </div>`;

  const legal = `        <div class="footer-col">
          <h2>${esc(t.chrome.footer.legal)}</h2>
          <ul>
            <li><a href="/privacy">${esc(t.chrome.footer.privacy)}</a></li>
            <li><a href="/terms">${esc(t.chrome.footer.terms)}</a></li>
            <li><a href="/delete-account">${esc(t.chrome.footer.deleteAccount)}</a></li>
            <li><a href="/support">${esc(t.chrome.footer.support)}</a></li>
            <li><a href="/contact">${esc(t.chrome.footer.contact)}</a></li>
            <li><a href="/child_safety_standards">${esc(t.chrome.footer.childSafety)}</a></li>
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
${col(t.chrome.groups.guides, [
    // Six, then the index. The footer listed every guide, which was fine at ten
    // and is a wall at sixteen; the column is a sample plus a way into the rest.
    ...PAGES.filter(p => p.group === 'guides').slice(0, 6)
      .map(p => [p.slug, t.pages[p.slug].h1]),
    ['guides', t.chrome.labels.allGuides],
  ])}
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
      <div class="container is-centered">
        <h2 class="section-title">${esc(copy.ctaTitle || t.chrome.cta.title)}</h2>
        <p class="section-subtitle">${esc(copy.ctaBody || t.chrome.cta.body)}</p>
        <div class="hero-actions">
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
      <div class="container is-narrow">
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
      <div class="container prose is-narrow">
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
      <div class="container is-narrow">
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
      <div class="container is-narrow">
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
  return `    <section class="section">
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

/**
 * The home page's middle: a showcase of three screens with the text beside
 * them, then the feature list, then the three steps.
 *
 * The showcase rows alternate side to side. That rhythm is the only thing
 * telling a reader they have moved from one idea to the next — there is no
 * card, no border and no shadow doing it.
 */
function homeExtras(page, locale, t, copy) {
  const shots = page.showcaseShots || [];
  const rows = (copy.showcase || []).map((row, i) => {
    const media = deviceSingle(shots[i], t, { h1: row.h2 });
    const reversed = i % 2 === 1 ? ' is-reversed' : '';
    return `        <div class="feature-row${reversed}">
          <div class="feature-copy">
            <h2>${esc(row.h2)}</h2>
            <p>${esc(row.p)}</p>
          </div>
          <div class="feature-media">
${media}
          </div>
        </div>`;
  }).join('\n');

  const showcase = rows ? `    <section class="section" id="showcase">
      <div class="container">
${rows}
      </div>
    </section>` : '';

  const cards = (copy.cards || []).map(c => `          <div class="card">
            <h3>${esc(c.h3)}</h3>
            <p>${esc(c.p)}</p>
          </div>`).join('\n');

  const steps = (copy.steps || []).map((s2, i) => `          <div class="step">
            <div class="step-n" aria-hidden="true">0${i + 1}</div>
            <h3>${esc(s2.h3)}</h3>
            <p>${esc(s2.p)}</p>
          </div>`).join('\n');

  return `${showcase}

    <section class="section section-alt" id="features">
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
        <div class="grid-3 steps">
${steps}
        </div>
      </div>
    </section>`;
}

/**
 * A phone screenshot.
 *
 * The alt text is built from the locale's template and the page's own h1, so
 * eleven translations do not each need a caption written by hand — and no
 * English caption is smuggled into a Ukrainian page. Intrinsic width and height
 * come from the registry, which is what stops the image reserving the wrong box
 * and shoving the heading down as it loads.
 */
function shotImg(shotKey, t, copy, { eager = false, decorative = false } = {}) {
  const shot = SHOTS[shotKey];
  if (!shot) return '';
  const alt = decorative
    ? '' : String(t.chrome.labels.shotAlt || '%s').replace('%s', copy.h1);
  const loading = eager
    ? ' fetchpriority="high" decoding="async"'
    : ' loading="lazy" decoding="async"';
  return `<figure class="device"><img src="/assets/images/app/${shot.file}.png" ` +
    `alt="${esc(alt)}" width="${shot.w}" height="${shot.h}"${loading} /></figure>`;
}

/** One phone beside a block of text. */
function deviceSingle(shotKey, t, copy, opts) {
  const img = shotImg(shotKey, t, copy, opts);
  return img ? `        <div class="device-single">${img}</div>` : '';
}

/**
 * Two phones, angled, for the home hero.
 *
 * Only the first carries alt text. The pair is one picture of one app, and
 * giving the second phone the same sentence would make a screen reader read
 * the headline twice for no added information.
 */
function devicePair(a, b, t, copy) {
  const first = shotImg(a, t, copy, { eager: true });
  const second = shotImg(b, t, copy, { eager: true, decorative: true });
  if (!first) return '';
  return `        <div class="device-pair">${first}${second}</div>`;
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
${COMMON_HEAD}
  <script type="application/ld+json">
${structuredData(page, locale, t, copy)}
  </script>
</head>
<body class="page-${page.kind}">
  <a class="skip-link" href="#main">${esc(t.chrome.labels.skip)}</a>`;

  // The opening band. Home gets the asymmetric split with two phones; every
  // other page gets the same band, shorter, with one phone where the registry
  // names a screen for it and nothing where it does not.
  const heroActions = `          <div class="hero-actions">
            <a href="${PLAY_URL}" class="btn btn-primary" target="_blank" rel="noopener">${esc(t.chrome.cta.play)}</a>
            <a href="${hrefFor(locale, 'caller-identification')}" class="btn btn-outline">${esc(t.chrome.cta.secondary)}</a>
          </div>`;

  let hero;
  if (!page.slug) {
    hero = `    <section class="hero">
      <div class="container hero-split">
        <div>
          <h1>${esc(copy.h1)}</h1>
          <p>${esc(copy.lead)}</p>
${heroActions}
        </div>
${devicePair(page.shot, page.shotB, t, copy)}
      </div>
    </section>`;
  } else if (page.shot) {
    hero = `    <section class="hero hero-compact">
      <div class="container hero-split">
        <div>
          <h1>${esc(copy.h1)}</h1>
          <p>${esc(copy.lead)}</p>
        </div>
${deviceSingle(page.shot, t, copy, { eager: true })}
      </div>
    </section>`;
  } else {
    hero = `    <section class="hero hero-compact">
      <div class="container">
        <h1>${esc(copy.h1)}</h1>
        <p>${esc(copy.lead)}</p>
      </div>
    </section>`;
  }

  const main = [
    breadcrumbHtml(locale, t, page, copy),
    hero,
    answerHtml(t, copy),
    page.kind === 'home' ? homeExtras(page, locale, t, copy) : '',
    bodyHtml(copy),
    tableHtml(copy),
    faqHtml(t, copy),
    identityStrip(locale, t),
    relatedHtml(locale, t, page),
    ctaHtml(locale, t, copy),
  ].filter(Boolean).join('\n\n');

  return `${head}

${navHtml(locale, t, page.slug)}

  <main id="main" tabindex="-1">
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
 * The legal/support pages keep their hand-written bodies — and nothing else.
 *
 * They used to carry their own <nav> and <footer>, which is exactly the drift
 * this generator exists to prevent: three different footers, two different
 * navs, no language picker, and "for iOS and Android" on a page whose own CTA
 * says Android only. The chrome now comes from the same functions the
 * generated pages use, spliced in at two required markers.
 *
 * The picker points at each locale's home rather than a translated copy of the
 * page, because these pages are English-only. The hreflang tags still say so.
 */
function patchStaticPage(file, t) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // Cloudflare's asset handling serves `foo.html` at `/foo` and 307s the `.html`
  // form to it. A canonical pointing at the redirecting URL is a self-inflicted
  // wound, so every URL this build emits names the extensionless form.
  const slug = file.replace(/\.html$/, '');
  const url = `${BASE_URL}/${slug}`;
  const titleMatch = src.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = src.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const title = titleMatch ? titleMatch[1].trim() : 'TreeLinker';
  const description = descMatch ? descMatch[1] : '';

  let out = src;

  for (const marker of ['chrome:nav', 'chrome:footer']) {
    if (!out.includes(`<!-- ${marker} -->`)) {
      throw new Error(`${file}: missing <!-- ${marker} --> marker`);
    }
  }

  out = out
    .replace('<!-- chrome:nav -->',
      `<a class="skip-link" href="#main">${esc(t.chrome.labels.skip)}</a>\n` +
      staticNavHtml(t, slug))
    .replace('<!-- chrome:footer -->', footerHtml(DEFAULT_LOCALE, t));

  // Every internal link in the hand-written bodies still named the `.html`
  // form, so every one of them cost a redirect and defeated the active-nav
  // check. Rewrite them to the URLs the canonicals already claim.
  out = out.replace(/(href|src)="(?!https?:|mailto:|#|\/)([a-z0-9_./-]+?)(\.html)?((?:#[^"]*)?)"/gi,
    (m, attr, name, ext, hash) => {
      if (!ext) return `${attr}="/${name}${hash}"`;          // assets/js/script.js
      if (name === 'index') return `${attr}="/${hash}"`;      // index.html -> /
      return `${attr}="/${name}${hash}"`;
    });

  // Idempotent: never inject twice if the source already carries a canonical.
  if (/rel="canonical"/.test(out)) return out;

  const inject = `  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />
${openGraph({ title, description, url, locale: 'en' })}
${COMMON_HEAD}
`;

  // The hand-written heads carried their own stylesheet/manifest/icon tags;
  // COMMON_HEAD is now the single source for them.
  out = out.replace(/^[ \t]*<link rel="(?:stylesheet|manifest|icon|apple-touch-icon)"[^>]*>\r?\n/gim, '');

  return out.replace(/<\/head>/i, `${inject}</head>`);
}

/**
 * The static pages get the product nav, so a reader crossing from / to /privacy
 * does not lose it. The language picker links to each locale's home.
 */
function staticNavHtml(t, currentSlug) {
  const items = [
    ['', t.chrome.nav.home],
    ['family-tree-app', t.chrome.nav.familyTree],
    ['family-contact-manager', t.chrome.nav.contacts],
    ['caller-identification', t.chrome.nav.callerId],
    ['guides', t.chrome.nav.guides],
    ['compare', t.chrome.nav.compare],
  ];
  const links = items.map(([slug, label]) =>
    `          <li><a href="${hrefFor(DEFAULT_LOCALE, slug)}">${esc(label)}</a></li>`
  ).join('\n');

  const picker = LOCALES.map(l =>
    `            <li><a href="${hrefFor(l.code, '')}" hreflang="${l.hreflang}"${
      l.code === DEFAULT_LOCALE ? ' aria-current="true"' : ''}>${esc(l.name)}</a></li>`
  ).join('\n');

  return `  <nav class="site-nav" aria-label="${esc(t.chrome.nav.aria)}">
    <div class="container">
      <a href="/" class="nav-logo" aria-label="TreeLinker"><span class="nav-logo-img" aria-hidden="true"></span> TreeLinker</a>
      <ul class="nav-links" role="list">
${links}
          <li class="nav-lang">
            <button type="button" class="nav-lang-toggle" aria-expanded="false" aria-controls="lang-menu">
              ${esc(t.chrome.nav.language)}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <ul class="nav-lang-menu" id="lang-menu" role="list">
${picker}
            </ul>
          </li>
      </ul>
      <button class="nav-toggle" aria-label="${esc(t.chrome.nav.menu)}" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="3" y1="6"  x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  </nav>`;
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
            <h2>${esc(tt.pages[p.slug].h1)}</h2>
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
${COMMON_HEAD}
</head>
<body class="page-index">
  <a class="skip-link" href="#main">${esc(tt.chrome.labels.skip)}</a>
${navHtml(loc.code, tt, group)}
  <main id="main" tabindex="-1">
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
    write(path.join(DIST, s.file), patchStaticPage(s.file, t[DEFAULT_LOCALE]));
    count++;
  }
  // Search-engine site verification files. Copied byte-for-byte: the verifier
  // compares exact contents, so these must NOT go through the head injector that
  // the other hand-written pages use.
  for (const f of fs.readdirSync(ROOT)) {
    if (/^google[0-9a-f]+\.html$/.test(f) || /^BingSiteAuth\.xml$/.test(f) ||
        /^[0-9a-f]{8,128}\.txt$/.test(f)) {
      write(path.join(DIST, f), fs.readFileSync(path.join(ROOT, f), 'utf8'));
      console.log(`  verification file: ${f}`);
    }
  }

  // The 404 is served for arbitrary paths, so every URL in it must be
  // site-absolute — a relative asset path resolves against the missing page.
  write(path.join(DIST, '404.html'), patchStaticPage('404.html', t[DEFAULT_LOCALE]));
  write(path.join(DIST, 'manifest.webmanifest'), fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  write(path.join(DIST, 'sitemap.xml'), sitemap());
  write(path.join(DIST, 'robots.txt'), robots());

  console.log(`generated ${count} pages across ${LOCALES.length} locales`);
}

main();
