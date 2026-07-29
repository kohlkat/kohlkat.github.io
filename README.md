# SAGE Suite public site

Public, nonproprietary product and evidence hub for SAGE Suite. The site is
written for manufacturers, engineers, design partners, researchers, future
customers, and technical reviewers encountering the platform for the first
time.

## Local development

```powershell
npm install
npm run generate:simulation
npm run generate:replay
npm run dev
```

## Product journey

The homepage begins with the promise, “Make every difficult cut a decision you
can defend.” It then shows the customer outcome: a structured job model, ranked
process-plan alternatives, and an evidence-linked review packet. Simulation,
open-data research, and the five public-safe assurance checks support that
product story rather than replacing it.

## NVIDIA simulation evidence

The product page leads with a deterministic public aggregate from the full
disclosed NVIDIA Isaac Sim shadow campaign:

- 2,542 program comparisons with matching provenance records
- 659 verified shard archives
- nine shape/material coverage cells
- 46.7% median reduction in the campaign's composite synthetic objective
- 2,542 of 2,542 programs below their own same-simulator baselines

The reviewed aggregate is published at
`public/data/sage-public-nvidia-simulation-v1.json`. It contains counts,
coverage, distribution statistics, runtime scope, integrity status, and the
fail-closed model decision. It excludes raw command schedules, private
geometry, customer telemetry, objective composition, internal thresholds, and
model internals.

A separate retrospective aggregate at
`public/data/sage-public-nvidia-surface-integrity-v1.json` covers all 2,542
NVIDIA robot episodes. Its median modeled finish-pass interval is 1.78–3.43 µm,
with a 2.64 µm midpoint. Historical corner radius was not recorded, so the
result is explicitly assumption-bounded and `modeled_not_measured`; it is not
measured Ra or a surface-quality guarantee.

Robot articulation ran in NVIDIA Isaac Sim. Cutting loads were mechanistic and
high-frequency vibration was model-synthesized. The campaign therefore
demonstrates within-simulator shadow optimization and evidence capture; it is
not held-out policy generalization, physical cutting, measured cycle time, part
quality, or safety proof.

The homepage also embeds `public/media/sage-simulation-replay-v3.mp4`, a silent
36-second non-headless NVIDIA Isaac Sim 6.0.1 capture. It alternates three CNC
surrogate-training scenes with three NVIDIA UR10e robot shadow-optimization
scenes over the disclosed circle, rounded-rectangle, and slot classes.

`public/media/sage-isaac-capture-manifest-v3.json` records the six jobs and 864
RTX-rendered frames. The capture is newly generated and public-safe; it is not a
private campaign USD, customer program, physical cutting, measured machine
footage, or a hardware command stream.

The v3 robot scenes use a fixed-base UR10e. A separate public engineering
schematic introduces a proposed force-aware relative-pose study comparing the
same synthetic job across a fixed-base cell, a robot on a seventh-axis linear
rail, and a part on a two-axis tilt-rotary positioner. That comparison is not in
the current replay and is not a live ROS path, physical-machining result, or
measured efficiency claim.

## Public teaching data

`/simulation/` begins with the complete NVIDIA campaign and surface-integrity
aggregates, then publishes a separate deterministic 120-row generic CNC-like
teaching trace. Every teaching row is labeled `SIMULATED`, the observed count is
zero, surface roughness Ra is always null/unmeasured, and the advisory threshold
is fully disclosed as illustrative public-demo logic rather than SAGE
production policy.

## Research hub

`/research/` summarizes the public-safe SAGE research program:

- traceable machining and surface measurement;
- digital-twin verification, validation, and uncertainty quantification;
- transfer across machine, tool, material, geometry, pose, and time;
- force-aware relative pose across fixed-base, rail, and articulated-workpiece
  cell arrangements;
- evidence exchange and non-actuating shadow pilots;
- NIST CRADA, SBIR, and MEP collaboration routes; and
- a counsel-gated TechRxiv, Zenodo, and peer-review release sequence.

The site never publishes the founder-private NIST draft, patent material,
weights, objective coefficients, calibration internals, private source, raw
programs, or customer data.

```powershell
npm run generate:simulation
npm run check:simulation
npm run generate:replay
npm run check:replay
```

The simulation generator writes CSV, JSON, and `SHA256SUMS.txt` under
`public/data/`. The replay command verifies the reviewed Isaac Sim MP4, poster,
captions, capture manifest, and web-binding manifest under `public/media/`;
it does not regenerate or substitute the captured renderer output.

## Verification

```powershell
npm run verify
```

The verifier checks the NVIDIA aggregate schema and reviewed values, public
simulation artifacts, evidence labels, unknown-value handling, source hashes,
static downloads, crawler policy, security headers, canonical URLs, and
public-copy disclosure boundaries.

## Deployment

Vercel is the sole production host:

`https://sage-public-evidence.vercel.app`

The retired GitHub Pages deployment workflow is intentionally absent. Preview
deployments should be verified before promotion to production. Custom-domain
preparation lives in `docs/CUSTOM_DOMAIN_CUTOVER.md`.

## Search, privacy, and crawler policy

- Conventional search and social-preview crawlers are permitted.
- Named AI-training and archive crawlers are denied in `app/robots.js`.
- `public/.well-known/tdmrep.json` reserves site-wide text-and-data-mining
  rights.
- Global metadata requests indexing without cached copies.
- `app/sitemap.js` publishes the search sitemap.
- Visible-content-matched JSON-LD describes the product and public datasets.
- Google Analytics loads only after visitor consent when configured.
- Vercel response headers enforce CSP, framing, permissions, referrer, and
  content-type boundaries.

## Truth boundary

- Physical CNC and robot command authority is disabled.
- Simulation evidence remains labeled and missing values remain unknown.
- Campaign gains are not presented as measured machine outcomes.
- The saved surrogate was not promoted after independent held-out and
  generated-boundary checks.
- No customer data, raw campaign geometry, command schedules, private
  thresholds, proprietary algorithms, or model internals are published.
- Kernel descriptions stop at the user-facing question and fail-closed
  outcome.
