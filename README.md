# TreeLinker Website

Static marketing and legal website for the TreeLinker app.

## Structure

```
treelinker-website/
├── index.html            # Landing page
├── privacy.html          # Privacy Policy
├── terms.html            # Terms of Service
├── delete-account.html   # Account deletion request
├── support.html          # Support center + FAQ
├── contact.html          # Contact form
├── 404.html              # Custom 404 page
├── assets/
│   ├── css/style.css     # Global stylesheet
│   ├── js/script.js      # Nav, forms, accordion
│   ├── images/           # Photos and illustrations
│   └── icons/            # Favicon, PWA icons
├── robots.txt
├── sitemap.xml
└── manifest.webmanifest
```

## Getting Started

Open `index.html` directly in a browser, or serve with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Customisation

- **Domain**: Replace `https://treelinker.app` in `sitemap.xml` and `robots.txt` with your real domain.
- **Contact form endpoint**: In `assets/js/script.js`, wire the `contact-form` submit handler to your backend or a service like Formspree / EmailJS.
- **Delete-account endpoint**: Do the same for the `delete-form` handler, pointing it at your API.
- **PWA icons**: Add `assets/icons/icon-192.png` and `assets/icons/icon-512.png` for installable PWA support.
- **Favicon**: Add `assets/icons/favicon.svg` (or `.png`) to show a browser-tab icon.
- **Brand colours**: Edit the CSS custom properties at the top of `assets/css/style.css`.

## Deployment

The site is fully static — deploy to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any CDN.
