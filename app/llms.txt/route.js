import { siteOrigin } from "../../lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = `# SAGE Suite

> Public project hub for assurance-first manufacturing intelligence.

Canonical site: ${siteOrigin}/
Founder: David Kohler
Location: Pittsburgh, Pennsylvania, USA

## What SAGE Suite is

SAGE Suite is a functional, advisory prototype for evidence-linked CNC process
planning. It represents setups and workingsteps in typed plans, preserves
provenance, distinguishes simulated from observed evidence, records independent
checks where implemented, and requires qualified human approval.

## Trust boundary

- No physical CNC or robot command authority.
- No replacement for qualified people, OEM controls, or certified safety systems.
- Simulated evidence remains labeled.
- Missing values remain unknown rather than becoming reassuring zeros.
- Roadmap capabilities are not represented as deployed capabilities.

## Public sections

- Platform and current prototype: ${siteOrigin}/#platform
- Intended audiences: ${siteOrigin}/#audiences
- Trust boundary: ${siteOrigin}/#boundaries
- Roadmap: ${siteOrigin}/#roadmap
- Design-partner contact: ${siteOrigin}/#contact
- Privacy: ${siteOrigin}/privacy/

The proprietary implementation, private evidence, and private application
materials are intentionally not published on this site.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}
