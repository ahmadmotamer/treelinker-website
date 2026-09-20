/**
 * Site-wide configuration and the page registry.
 *
 * Every generated URL on this site comes from here. The page list is data, not
 * files on disk: `build-pages.js` walks it once per locale, so adding a page
 * means adding one entry here plus its copy in every `content/i18n/*.json`.
 *
 * BASE_URL is the one place the public origin is written down. At the time this
 * was added, `robots.txt` and `sitemap.xml` pointed search engines at
 * https://treelinker.app/ — a hostname that did not resolve — while the site was
 * actually served from treelinker.ahmedmosttamer.workers.dev. Everything
 * canonical, hreflang and sitemap-related is derived from this constant so that
 * mismatch can never happen again: change it here, rebuild, redeploy.
 */

// Point this at the custom domain once treelinker.app resolves and is attached to
// the Worker; until then it must match where the site is actually served, or every
// page tells search engines its real address is a host that does not exist.
const BASE_URL = 'https://treelinker.ahmedmosttamer.workers.dev';

/**
 * The locales the app ships (assets/languages/*.json in the Flutter repo).
 * `dir` drives <html dir> and the RTL stylesheet hook.
 * English is served at the site root; every other locale lives under /<code>/.
 */
const LOCALES = [
  { code: 'en', hreflang: 'en', name: 'English',    dir: 'ltr' },
  { code: 'ar', hreflang: 'ar', name: 'العربية',     dir: 'rtl' },
  { code: 'de', hreflang: 'de', name: 'Deutsch',    dir: 'ltr' },
  { code: 'es', hreflang: 'es', name: 'Español',    dir: 'ltr' },
  { code: 'fr', hreflang: 'fr', name: 'Français',   dir: 'ltr' },
  { code: 'id', hreflang: 'id', name: 'Indonesia',  dir: 'ltr' },
  { code: 'pt', hreflang: 'pt', name: 'Português',  dir: 'ltr' },
  { code: 'ru', hreflang: 'ru', name: 'Русский',    dir: 'ltr' },
  { code: 'tr', hreflang: 'tr', name: 'Türkçe',     dir: 'ltr' },
  { code: 'uk', hreflang: 'uk', name: 'Українська', dir: 'ltr' },
  { code: 'zh', hreflang: 'zh', name: '中文',        dir: 'ltr' },
];

const DEFAULT_LOCALE = 'en';

const PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.sonbola.treelinker';

/**
 * The page registry.
 *
 * `slug`    — URL path, relative to the locale root. '' is the home page.
 * `kind`    — picks the template and the structured-data type.
 * `group`   — which nav/footer cluster and breadcrumb trail it belongs to.
 * `related` — slugs rendered as "related pages"; internal linking is the only
 *             reason a 24-page site is more findable than a 6-page one.
 *
 * Order matters: it is the order of the sitemap and of the section indexes.
 */
const PAGES = [
  { slug: '',  kind: 'home', group: 'home', priority: '1.0',
    related: ['family-tree-app', 'caller-identification', 'family-contact-manager'] },

  // ---- Top-level landing pages: one per search intent ----
  { slug: 'family-tree-app',        kind: 'landing', group: 'solutions', priority: '0.9',
    related: ['features/family-tree', 'guides/how-to-create-a-family-tree', 'compare/family-tree-apps'] },
  { slug: 'family-contact-manager', kind: 'landing', group: 'solutions', priority: '0.9',
    related: ['features/contacts', 'guides/how-to-organize-family-contacts', 'compare/contact-management-apps'] },
  { slug: 'relationship-manager',   kind: 'landing', group: 'solutions', priority: '0.9',
    related: ['features/relationships', 'guides/how-to-keep-track-of-family-relationships', 'caller-identification'] },
  { slug: 'family-organizer',       kind: 'landing', group: 'solutions', priority: '0.8',
    related: ['features/groups', 'features/tags', 'guides/how-to-organize-relatives'] },
  { slug: 'family-memory-app',      kind: 'landing', group: 'solutions', priority: '0.8',
    related: ['features/memories', 'features/events', 'guides/how-to-document-family-memories'] },
  { slug: 'caller-identification',  kind: 'landing', group: 'solutions', priority: '0.95',
    related: ['features/caller-identification', 'relationship-manager', 'family-contact-manager'] },

  // ---- Guides: the question-shaped pages ----
  { slug: 'guides/how-to-create-a-family-tree',              kind: 'guide', group: 'guides', priority: '0.7',
    related: ['family-tree-app', 'features/family-tree', 'guides/how-to-organize-relatives'] },
  { slug: 'guides/how-to-organize-family-contacts',          kind: 'guide', group: 'guides', priority: '0.7',
    related: ['family-contact-manager', 'features/tags', 'guides/how-to-organize-relatives'] },
  { slug: 'guides/how-to-keep-track-of-family-relationships', kind: 'guide', group: 'guides', priority: '0.7',
    related: ['relationship-manager', 'features/relationships', 'caller-identification'] },
  { slug: 'guides/how-to-organize-relatives',                kind: 'guide', group: 'guides', priority: '0.7',
    related: ['family-organizer', 'features/groups', 'features/tags'] },
  { slug: 'guides/how-to-remember-family-birthdays',         kind: 'guide', group: 'guides', priority: '0.7',
    related: ['features/events', 'family-organizer', 'guides/how-to-document-family-memories'] },
  { slug: 'guides/how-to-document-family-memories',          kind: 'guide', group: 'guides', priority: '0.7',
    related: ['family-memory-app', 'features/memories', 'features/events'] },

  { slug: 'guides/how-to-know-how-someone-is-related-to-you', kind: 'guide', group: 'guides', priority: '0.75',
    related: ['relationship-manager', 'features/relationships', 'caller-identification'] },
  { slug: 'guides/how-to-keep-track-of-in-laws',              kind: 'guide', group: 'guides', priority: '0.7',
    related: ['guides/how-to-organize-relatives', 'features/family-tree', 'relationship-manager'] },
  { slug: 'guides/how-to-remember-distant-relatives',         kind: 'guide', group: 'guides', priority: '0.7',
    related: ['guides/how-to-know-how-someone-is-related-to-you', 'caller-identification', 'features/family-tree'] },
  { slug: 'guides/how-to-manage-hundreds-of-contacts',        kind: 'guide', group: 'guides', priority: '0.7',
    related: ['family-contact-manager', 'features/contacts', 'guides/how-to-add-tags-to-contacts'] },
  { slug: 'guides/how-to-add-tags-to-contacts',               kind: 'guide', group: 'guides', priority: '0.7',
    related: ['features/tags', 'family-organizer', 'guides/how-to-organize-family-contacts'] },
  { slug: 'guides/how-to-organize-family-events',             kind: 'guide', group: 'guides', priority: '0.7',
    related: ['features/events', 'features/groups', 'guides/how-to-remember-family-birthdays'] },
  { slug: 'guides/how-to-organize-family-photos-and-memories', kind: 'guide', group: 'guides', priority: '0.7',
    related: ['features/memories', 'family-memory-app', 'guides/how-to-document-family-memories'] },

  // ---- Comparisons: the highest-citation content format ----
  { slug: 'compare/family-tree-vs-contact-manager', kind: 'compare', group: 'compare', priority: '0.8',
    related: ['family-tree-app', 'family-contact-manager', 'relationship-manager'] },
  { slug: 'compare/family-tree-apps',               kind: 'compare', group: 'compare', priority: '0.8',
    related: ['family-tree-app', 'features/family-tree', 'guides/how-to-create-a-family-tree'] },
  { slug: 'compare/contact-management-apps',        kind: 'compare', group: 'compare', priority: '0.8',
    related: ['family-contact-manager', 'features/contacts', 'caller-identification'] },
  { slug: 'compare/what-is-a-family-relationship-app', kind: 'compare', group: 'compare', priority: '0.85',
    related: ['relationship-manager', 'compare/family-tree-vs-contact-manager', 'compare/contact-management-apps'] },

  // ---- Feature pages: one per thing the app actually does ----
  { slug: 'features/family-tree',            kind: 'feature', group: 'features', priority: '0.6',
    related: ['family-tree-app', 'features/relationships', 'guides/how-to-create-a-family-tree'] },
  { slug: 'features/contacts',               kind: 'feature', group: 'features', priority: '0.6',
    related: ['family-contact-manager', 'features/tags', 'guides/how-to-organize-family-contacts'] },
  { slug: 'features/relationships',          kind: 'feature', group: 'features', priority: '0.6',
    related: ['relationship-manager', 'features/family-tree', 'features/caller-identification'] },
  { slug: 'features/groups',                 kind: 'feature', group: 'features', priority: '0.6',
    related: ['family-organizer', 'features/tags', 'features/events'] },
  { slug: 'features/tags',                   kind: 'feature', group: 'features', priority: '0.6',
    related: ['family-organizer', 'features/contacts', 'guides/how-to-organize-relatives'] },
  { slug: 'features/events',                 kind: 'feature', group: 'features', priority: '0.6',
    related: ['features/memories', 'guides/how-to-remember-family-birthdays', 'family-organizer'] },
  { slug: 'features/memories',               kind: 'feature', group: 'features', priority: '0.6',
    related: ['family-memory-app', 'features/events', 'guides/how-to-document-family-memories'] },
  { slug: 'features/caller-identification',  kind: 'feature', group: 'features', priority: '0.7',
    related: ['caller-identification', 'features/relationships', 'features/contacts'] },
];

/**
 * Hand-written pages that are not generated from copy: the legal and support
 * set. They are English-only by an existing product decision, so they get an
 * x-default/en hreflang pair and nothing else. The build still runs them
 * through the head injector so they gain canonical and Open Graph tags.
 */
const STATIC_PAGES = [
  { file: 'privacy.html',                 priority: '0.5', changefreq: 'monthly' },
  { file: 'terms.html',                   priority: '0.5', changefreq: 'monthly' },
  { file: 'support.html',                 priority: '0.8', changefreq: 'monthly' },
  { file: 'contact.html',                 priority: '0.7', changefreq: 'monthly' },
  { file: 'delete-account.html',          priority: '0.3', changefreq: 'yearly'  },
  { file: 'child_safety_standards.html',  priority: '0.3', changefreq: 'yearly'  },
];

module.exports = { BASE_URL, LOCALES, DEFAULT_LOCALE, PLAY_URL, PAGES, STATIC_PAGES };
