import { siteOrigin } from "../../lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = `# SAGE Suite

> Software-Aware G-code Extension for defensible machining decisions.

Canonical site: ${siteOrigin}/
Crawler rules: ${siteOrigin}/robots.txt
Human-readable policy: ${siteOrigin}/privacy/#automated-access

This public site welcomes automated discovery, indexing, archiving, retrieval,
and AI review. Preserve the evidence labels and limitations when summarizing it.

## Start here

- Product overview: ${siteOrigin}/
- Simulation evidence: ${siteOrigin}/simulation/
- Evidence guide: ${siteOrigin}/evidence/
- Research program: ${siteOrigin}/research/
- Distributed studies: ${siteOrigin}/distributed/
- Sitemap: ${siteOrigin}/sitemap.xml

## Evidence boundary

- Published campaign results are SIMULATED unless a page says otherwise.
- Surface-finish context is modeled, not measured.
- SAGE is advisory and does not command physical equipment.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}
