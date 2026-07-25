# SAGE Suite project site

Public, nonproprietary project and product hub for SAGE Suite. The site serves
manufacturers, engineers, design partners, researchers, future customers, and
other ecosystem participants; it is not specific to any accelerator.

## Local development

```powershell
npm install
npm run dev
```

## Deployment

Pushes to `main` build a static Next.js export and deploy it to
`https://kohlkat.github.io` through GitHub Pages.

## Search and measurement

- `app/robots.js` and `app/sitemap.js` publish crawl controls.
- `app/page.js` publishes visible-content-matched JSON-LD.
- `public/opengraph-image.png` provides the social preview.
- `app/llms.txt/route.js` publishes a public-safe project summary for AI
  readers. It is not treated as a Google ranking mechanism.
- `GOOGLE_SITE_VERIFICATION` is an optional GitHub Actions repository variable
  used to emit the Search Console verification meta tag.
- `GA_MEASUREMENT_ID` is an optional GitHub Actions repository variable. The
  Google tag loads only after a visitor grants analytics consent.
- `SITE_URL` is the validated canonical HTTPS origin. It remains
  `https://kohlkat.github.io` until the secure custom-domain cutover.

## Custom domain

`docs/CUSTOM_DOMAIN_CUTOVER.md` and `scripts/custom-domain.ps1` prepare
`kohler-engineering.com` without pointing Pages at an unowned domain. The CLI
fails closed on missing registration, ownership TXT, unsafe DNS, wildcard
records, or incompatible CAA records before changing GitHub.

## Truth boundary

- Current prototype capabilities and roadmap items are labeled separately.
- Physical CNC and robot command authority is disabled.
- SAGE does not replace qualified human review, OEM controls, or certified safety systems.
- Simulated evidence remains labeled, and missing values remain unknown.
