import { siteOrigin } from "../../lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = `# SAGE Suite automated-access policy

This file communicates policy only. It is not an alternate copy of the site.

Canonical site: ${siteOrigin}/
Crawler rules: ${siteOrigin}/robots.txt
TDM rights reservation: ${siteOrigin}/.well-known/tdmrep.json
Human-readable policy: ${siteOrigin}/privacy/#automated-access

Automated model training, retrieval augmentation, AI answer synthesis, dataset
collection, bulk extraction, and archival copying are not authorized without
written permission. Respect robots.txt and the site-wide TDM reservation.

Ordinary human access and the explicitly allowlisted conventional search and
social-preview crawlers remain permitted. These signals are requests to
cooperative systems, not technical access control.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}
