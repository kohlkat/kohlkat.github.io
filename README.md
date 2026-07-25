# SAGE Suite project site

Public, nonproprietary project and product hub for SAGE Suite. The site serves
manufacturers, engineers, design partners, researchers, future customers, and
other ecosystem participants; it is not specific to any accelerator.

## Local development

```powershell
npm install
npm run generate:simulation
npm run dev
```

## Public simulation evidence

`/simulation/` publishes a deterministic 120-row generic CNC-like trace. Every
row is labeled `SIMULATED`, the observed count is zero, surface roughness Ra is
always null/unmeasured, and the only advisory threshold is fully disclosed as
illustrative public-demo logic rather than SAGE production policy.

```powershell
npm run generate:simulation
npm run check:simulation
```

The generator writes CSV, JSON, and `SHA256SUMS.txt` under `public/data/`.
The build verifier checks the row schema, evidence labels, unknown-value
handling, demo-rule derivation, source/artifact hashes, static downloads, and
public-safe copy.

## Newcomer evidence guide

`/evidence/` begins with a plain-language product tour and five public-safe
assurance-kernel descriptions. It then offers an optional source-synchronized
browser replay, the reproduced Bosch open-data boundary result, a collapsed
supporting research ledger, common questions, and a full glossary.

The five-source dataset record is supporting evidence, not the product
architecture. The site does not claim that Bosch, AI4I, NASA Milling, NUAA, and
PHM 2010 trained one joint public checkpoint.

## Deployment

Pushes to `main` build a static Next.js export and deploy it to
`https://kohlkat.github.io` through GitHub Pages.

## Search and measurement

- `app/robots.js` explicitly allows conventional search/social-preview
  crawlers, denies named AI/archive crawlers, and denies other cooperative
  crawlers by default without blocking human browsers.
- `public/.well-known/tdmrep.json` reserves site-wide text-and-data-mining
  rights.
- Global metadata requests indexing without cached copies.
- `app/sitemap.js` publishes the conventional search sitemap.
- `app/page.js` publishes visible-content-matched JSON-LD.
- `app/simulation/page.js` publishes visible-content-matched `Dataset` JSON-LD
  for the downloadable public simulation artifacts.
- `public/opengraph-image.png` provides the social preview.
- `app/llms.txt/route.js` publishes only the automated-access policy, not a
  machine-oriented copy of the site.
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
- The public demo threshold is not SAGE production policy or a machine-safety
  limit.
- No customer data, real machine telemetry, production thresholds, private
  schemas, or proprietary SAGE algorithms are published.
- Kernel descriptions stop at the user-facing question and fail-closed outcome.
  Methods, formulas, calibration, thresholds, internal composition, private
  identifiers, private legal material, and model internals remain private.
