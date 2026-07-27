# `kohler-engineering.com` Vercel cutover

The canonical production origin remains
`https://sage-public-evidence.vercel.app` until the domain is purchased and
verified. Do not publish DNS records or change `NEXT_PUBLIC_SITE_URL` before
ownership is confirmed.

## Before purchase

1. Keep Vercel as the only production host.
2. Keep the GitHub Pages deployment workflow disabled.
3. Verify `npm run verify` passes with the Vercel origin.
4. Do not add speculative DNS, CAA, or verification records.

## After purchase

1. Add `kohler-engineering.com` and `www.kohler-engineering.com` to the existing
   `sage-public-evidence` Vercel project.
2. Copy the exact DNS records Vercel provides into the registrar DNS panel.
3. Wait for Vercel to report both domains as verified and the TLS certificate
   as valid.
4. Make the apex domain primary and redirect `www` to the apex.
5. Set `NEXT_PUBLIC_SITE_URL=https://kohler-engineering.com` for production.
6. Build a preview, run `npm run verify`, and inspect canonical, sitemap,
   robots, Open Graph, privacy, and security headers.
7. Promote the verified preview to production.
8. Add the new domain property in Google Search Console and submit
   `https://kohler-engineering.com/sitemap.xml`.

## Fail-closed checks

- No wildcard DNS record points unrelated subdomains at the site.
- No legacy GitHub Pages `A`, `AAAA`, or `CNAME` record remains.
- HTTPS is valid before canonical URLs change.
- Both apex and `www` resolve only to the intended Vercel project.
- No deployment token, registrar credential, or verification secret is stored
  in this repository.
- The Vercel URL remains available until the custom-domain deployment is
  independently verified.
